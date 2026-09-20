import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { unsubscribeNewsletterSubscriber } from "@/lib/newsletter-storage";
import { serverLog } from "@/lib/server-log";

export const runtime = "nodejs";
const eventSchema = z.object({
  event_type: z.string(),
  data: z.object({ subscriber: z.string().min(1).max(200) }),
});

export async function POST(request: Request) {
  const secret = process.env.BUTTONDOWN_WEBHOOK_SIGNING_KEY;
  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (!secret || !apiKey) return Response.json({ error: "Webhook unavailable" }, { status: 503 });
  const signature = request.headers.get("x-buttondown-signature") || "";
  if (!/^sha256=[a-f0-9]{64}$/i.test(signature)) return Response.json({ error: "Invalid signature" }, { status: 401 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ error: "Empty body" }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 16000) {
      await reader.cancel();
      return Response.json({ error: "Body too large" }, { status: 413 });
    }
    chunks.push(value);
  }
  const raw = Buffer.concat(chunks);
  const expected = createHmac("sha256", secret).update(raw).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature.slice(7), "hex"))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }
  let payload: unknown;
  try { payload = JSON.parse(raw.toString("utf8")); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = eventSchema.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "Invalid event" }, { status: 400 });
  if (parsed.data.event_type !== "subscriber.unsubscribed") return Response.json({ ok: true, ignored: true });
  try {
    const base = process.env.BUTTONDOWN_API_BASE_URL || "https://api.buttondown.email/v1";
    const url = new URL(`${base.replace(/\/+$/, "")}/subscribers/${encodeURIComponent(parsed.data.data.subscriber)}`);
    if (url.protocol !== "https:") throw new Error("HTTPS required");
    const response = await fetch(url, {
      headers: { Authorization: `Token ${apiKey}` },
      signal: AbortSignal.timeout(10000), cache: "no-store",
    });
    if (!response.ok) throw new Error("Subscriber lookup failed");
    const subscriber = z.object({ email_address: z.string().email(), type: z.string() }).parse(await response.json());
    // Buttondown events contain an ID, not an email. Read its current state so
    // replayed/late unsubscribe events do not undo a subsequent re-subscription.
    // Repeating the same status update is idempotent; no local replay cache needed.
    if (subscriber.type !== "unsubscribed") return Response.json({ ok: true, ignored: true });
    await unsubscribeNewsletterSubscriber(subscriber.email_address.trim().toLowerCase());
    return Response.json({ ok: true });
  } catch {
    serverLog("error", "newsletter.unsubscribe_failed");
    return Response.json({ error: "Reconciliation failed; retry delivery" }, { status: 503 });
  }
}
