import { z } from "zod";
export const emailSchema = z.string().trim().email().max(254);
export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  organisation: z.string().trim().max(160).default(""),
  interest: z.string().trim().max(160).default(""),
  context: z.string().trim().max(220).default(""),
  message: z.string().trim().min(20).max(5000),
  division: z.enum(["engineering", "asset-management"]),
  consent: z.literal(true),
  website: z.string().max(500).default(""),
});
export const newsletterSchema = z.object({
  email: emailSchema,
  consent: z.literal(true),
  website: z.string().max(500).default(""),
});
const counters = new Map<string, { count: number; expires: number }>();
export function consumeLimit(key: string, now = Date.now()) {
  for (const [k, v] of counters) if (v.expires <= now) counters.delete(k);
  const current = counters.get(key);
  if (current && current.count >= 5) return false;
  if (!current && counters.size >= 10000) return false;
  counters.set(key, {
    count: (current?.count || 0) + 1,
    expires: current?.expires || now + 600000,
  });
  return true;
}
export async function readSubmission(request: Request) {
  const origin = request.headers.get("origin");
  const actual = new URL(request.url);
  const allowed = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
    : actual.origin;
  if (
    origin &&
    origin !== allowed &&
    !(process.env.NODE_ENV !== "production" && origin === actual.origin)
  )
    return {
      error: "This request origin is not allowed.",
      status: 403,
    } as const;
  if (!request.headers.get("content-type")?.includes("application/json"))
    return { error: "Please submit JSON.", status: 415 } as const;
  const reader = request.body?.getReader();
  if (!reader) return { error: "The request is empty.", status: 400 } as const;
  let total = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 16000) {
      await reader.cancel();
      return { error: "This submission is too large.", status: 413 } as const;
    }
    chunks.push(value);
  }
  try {
    const bytes = new Uint8Array(total);
    let pos = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, pos);
      pos += chunk.byteLength;
    }
    return { data: JSON.parse(new TextDecoder().decode(bytes)) } as const;
  } catch {
    return { error: "The submission could not be read.", status: 400 } as const;
  }
}
export function requestKey(request: Request, category: string) {
  const ip =
    process.env.TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown"
      : "local";
  return `${category}:${ip}`;
}
