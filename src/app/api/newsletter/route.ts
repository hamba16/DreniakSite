import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  newsletterSchema,
  readSubmission,
  consumeLimit,
  requestKey,
} from "@/lib/intake";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const body = await readSubmission(request);
  if ("error" in body)
    return Response.json({ error: body.error }, { status: body.status });
  const parsed = newsletterSchema.safeParse(body.data);
  if (!parsed.success)
    return Response.json(
      { error: "Please enter a valid email address and consent to subscribe." },
      { status: 400 },
    );
  if (parsed.data.website)
    return Response.json(
      { error: "This signup could not be accepted." },
      { status: 400 },
    );
  if (!consumeLimit(requestKey(request, "newsletter")))
    return Response.json(
      { error: "Too many attempts. Please try again in ten minutes." },
      { status: 429, headers: { "Retry-After": "600" } },
    );
  const record = {
    email: parsed.data.email.toLowerCase(),
    consent: true,
    consentVersion: "2026-09-10",
    createdAt: new Date().toISOString(),
    source: "dreniak-website",
  };
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
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Signup storage rejected");
    } else if (directory) {
      if (!path.isAbsolute(directory))
        throw new Error("An absolute persistent directory is required");
      await mkdir(directory, { recursive: true });
      await appendFile(
        path.join(directory, "newsletter.jsonl"),
        JSON.stringify(record) + "\n",
        { encoding: "utf8", mode: 0o600 },
      );
    } else {
      return Response.json(
        {
          error:
            "Newsletter signup is not available yet. Please email info@dreniak.com to register your interest.",
        },
        { status: 503 },
      );
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Your signup could not be saved. Please try again later." },
      { status: 502 },
    );
  }
}
