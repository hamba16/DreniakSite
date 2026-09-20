import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { consumeLimit } from "./intake";
import { serverLog } from "./server-log";

// Memory is the single-process default. Supabase shares the same atomic fixed
// window across any host; configured-store failures must never bypass the limit.
export async function consumePublicLimit(key: string): Promise<boolean | null> {
  const store = process.env.RATE_LIMIT_STORE || "memory";
  if (store === "memory") return consumeLimit(key);
  try {
    if (store !== "supabase") throw new Error("Invalid rate limit store");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !secret) throw new Error("Missing rate limit configuration");
    const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await db.rpc("consume_public_limit", {
      bucket_key: createHash("sha256").update(key).digest("hex"),
    }).abortSignal(AbortSignal.timeout(5000));
    if (error || typeof data !== "boolean") throw new Error("Rate limit store unavailable");
    return data;
  } catch {
    serverLog("error", "intake.rate_limit_unavailable", { store });
    return null;
  }
}
