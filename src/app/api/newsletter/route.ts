import { createHash, createHmac } from "node:crypto";
import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  newsletterSchema,
  readSubmission,
  consumeLimit,
  requestKey,
} from "@/lib/intake";
import { serverLog } from "@/lib/server-log";
import { upsertNewsletterSubscriber } from "@/lib/newsletter-storage";

export const runtime = "nodejs";

const retryDelays = [250, 750, 1500];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type ButtondownFailureReason =
  | "authentication"
  | "rate_limit"
  | "server"
  | "network"
  | "configuration"
  | "suppressed"
  | "unknown";

function classifyButtondownFailure(status?: number, code?: string): ButtondownFailureReason {
  if (status === 401 || status === 403) return "authentication";
  if (status === 429) return "rate_limit";
  if (status !== undefined && status >= 500) return "server";
  if (code === "subscriber_suppressed") return "suppressed";
  return status === undefined ? "network" : "unknown";
}

async function sendButtondownSubscriber(email: string) {
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  const baseUrl = process.env.BUTTONDOWN_API_BASE_URL || "https://api.buttondown.email/v1";
  if (!apiKey) {
    return { ok: false as const, reason: "configuration" as const };
  }
  let endpoint: URL;
  try {
    endpoint = new URL(`${baseUrl.replace(/\/+$/, "")}/subscribers`);
    if (endpoint.protocol !== "https:") throw new Error("HTTPS is required");
  } catch {
    return { ok: false as const, reason: "configuration" as const };
  }

  for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "application/json",
          "X-Buttondown-Collision-Behavior": "add",
        },
        body: JSON.stringify({ email_address: email }),
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) return { ok: true as const, duplicate: false };
      const text = await response.text();
      let code: string | undefined;
      try {
        const body = JSON.parse(text) as { code?: string; detail?: string };
        code = body.code || body.detail;
      } catch {
        code = text;
      }
      if (
        response.status === 400 &&
        /already|duplicate|collision|subscriber_exists/i.test(code || text)
      ) {
        return { ok: true as const, duplicate: true };
      }
      const reason = classifyButtondownFailure(response.status, code);
      if (!["rate_limit", "server"].includes(reason) || attempt === retryDelays.length) {
        return { ok: false as const, reason, status: response.status };
      }
    } catch {
      if (attempt === retryDelays.length) {
        return { ok: false as const, reason: "network" as const };
      }
    }
    await sleep(retryDelays[attempt]);
  }
  return { ok: false as const, reason: "unknown" as const };
}

async function sendWebhook(
  endpoint: string,
  token: string,
  record: Record<string, unknown>,
  idempotencyKey: string,
) {
  const secret = process.env.NEWSLETTER_WEBHOOK_SECRET;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = JSON.stringify(record);
  const signature = secret
    ? createHmac("sha256", secret)
        .update(`${timestamp}.${payload}`)
        .digest("hex")
    : undefined;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey,
          "X-Dreniak-Timestamp": timestamp,
          ...(signature
            ? { "X-Dreniak-Signature": `sha256=${signature}` }
            : {}),
        },
        body: payload,
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok || (response.status >= 400 && response.status < 500))
        return response;
      lastError = new Error(`Webhook returned ${response.status}`);
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Webhook request failed");
    }
    if (attempt < retryDelays.length) await sleep(retryDelays[attempt]);
  }
  throw lastError || new Error("Webhook request failed");
}

export async function POST(request: Request) {
  const body = await readSubmission(request);
  if ("error" in body) {
    serverLog("warn", "newsletter.rejected", {
      reason: "request",
      status: body.status,
    });
    return Response.json({ error: body.error }, { status: body.status });
  }

  const parsed = newsletterSchema.safeParse(body.data);
  if (!parsed.success) {
    serverLog("warn", "newsletter.rejected", {
      reason: "validation",
      status: 400,
    });
    return Response.json(
      { error: "Please enter a valid email address and consent to subscribe." },
      { status: 400 },
    );
  }
  if (parsed.data.website) {
    serverLog("warn", "newsletter.rejected", {
      reason: "honeypot",
      status: 400,
    });
    return Response.json(
      { error: "This signup could not be accepted." },
      { status: 400 },
    );
  }
  if (!consumeLimit(requestKey(request, "newsletter"))) {
    serverLog("warn", "newsletter.rejected", {
      reason: "rate_limit",
      status: 429,
    });
    return Response.json(
      { error: "Too many attempts. Please try again in ten minutes." },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  }

  if (process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED === "false") {
    serverLog("info", "newsletter.disabled");
    return Response.json(
      {
        error:
          "Newsletter signup is not available yet. Please email info@dreniak.com to register your interest.",
      },
      { status: 503 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const record = {
    email,
    consent: true,
    consentVersion: "2026-09-10",
    createdAt: new Date().toISOString(),
    source: "dreniak-website",
  };
  const provider = process.env.NEWSLETTER_PROVIDER || "buttondown";

  if (provider === "buttondown") {
    if (!process.env.BUTTONDOWN_API_KEY) {
      serverLog("error", "newsletter.unavailable", {
        reason: "missing_buttondown_api_key",
      });
      return Response.json(
        {
          error:
            "Newsletter signup is not available yet. Please email info@dreniak.com to register your interest.",
        },
        { status: 503 },
      );
    }
    try {
      await upsertNewsletterSubscriber({
        email,
        subscribed_at: record.createdAt,
        status: "active",
        source: record.source,
        consent_version: record.consentVersion,
      });
    } catch (error) {
      serverLog("error", "newsletter.supabase_failed", {
        reason: error instanceof Error ? error.message : "unknown",
      });
      return Response.json(
        { error: "Your signup could not be saved. Please try again later." },
        { status: 503 },
      );
    }

    const buttondown = await sendButtondownSubscriber(email);
    if (!buttondown.ok) {
      serverLog("error", "newsletter.buttondown_sync_failed", {
        reason: buttondown.reason,
        status: "status" in buttondown ? buttondown.status : undefined,
      });
      // Supabase is authoritative. A retry/reconciliation worker is intentionally
      // deferred until subscriber volume justifies durable queue infrastructure.
      return Response.json({ ok: true, synced: false });
    }
    serverLog("info", "newsletter.buttondown_synced", {
      duplicate: buttondown.duplicate,
    });
    return Response.json({ ok: true, synced: true, duplicate: buttondown.duplicate });
  }

  if (!["webhook", "filesystem"].includes(provider)) {
    serverLog("error", "newsletter.unavailable", {
      reason: "invalid_provider",
    });
    return Response.json(
      { error: "Newsletter signup is not available yet. Please email info@dreniak.com to register your interest." },
      { status: 503 },
    );
  }

  const idempotencyKey = createHash("sha256").update(record.email).digest("hex");
  const endpoint = process.env.NEWSLETTER_WEBHOOK_URL;
  const directory =
    process.env.NEWSLETTER_DATA_DIR ||
    (process.env.NODE_ENV === "development"
      ? path.join(process.cwd(), ".data")
      : undefined);

  try {
    if (endpoint) {
      if (new URL(endpoint).protocol !== "https:")
        throw new Error("HTTPS is required");
      const token = process.env.NEWSLETTER_WEBHOOK_TOKEN;
      if (!token) throw new Error("A webhook token is required");
      const response = await sendWebhook(endpoint, token, record, idempotencyKey);
      if (!response.ok)
        throw new Error(`Signup storage rejected with ${response.status}`);
    } else if (directory) {
      if (!path.isAbsolute(directory))
        throw new Error("An absolute persistent directory is required");
      await mkdir(directory, { recursive: true });
      const file = path.join(directory, "newsletter.jsonl");
      try {
        const existing = await readFile(file, "utf8");
        if (
          existing
            .split("\n")
            .some((line) => line.includes(`"email":"${record.email}"`))
        ) {
          serverLog("info", "newsletter.duplicate", {
            storage: "filesystem",
          });
          return Response.json({ ok: true, duplicate: true });
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      await appendFile(file, `${JSON.stringify(record)}\n`, {
        encoding: "utf8",
        mode: 0o600,
      });
    } else {
      serverLog("info", "newsletter.unavailable", {
        reason: "storage_not_configured",
      });
      return Response.json(
        {
          error:
            "Newsletter signup is not available yet. Please email info@dreniak.com to register your interest.",
        },
        { status: 503 },
      );
    }
    serverLog("info", "newsletter.saved", {
      storage: endpoint ? "webhook" : "filesystem",
    });
    return Response.json({ ok: true });
  } catch (error) {
    serverLog("error", "newsletter.storage_failed", {
      reason: error instanceof Error ? error.message : "unknown",
      storage: endpoint ? "webhook" : directory ? "filesystem" : "unconfigured",
    });
    return Response.json(
      { error: "Your signup could not be saved. Please try again later." },
      { status: 502 },
    );
  }
}
