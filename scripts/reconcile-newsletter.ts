import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { reconcileSubscribers } from "../src/lib/newsletter-reconciliation";

loadEnvConfig(process.cwd());
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !process.env.BUTTONDOWN_API_KEY) throw new Error("Newsletter credentials are required");
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const apply = process.argv.includes("--apply");
  let cursor = "", checked = 0, failed = 0;
  while (true) {
    const { data, error } = await db.from("newsletter_subscribers").select("email")
      .eq("status", "active").gt("email", cursor).order("email").limit(100)
      .abortSignal(AbortSignal.timeout(10000));
    if (error) throw new Error("Subscriber page could not be read");
    if (!data?.length) break;
    if (apply) {
      const result = await reconcileSubscribers(data.map(row => row.email));
      failed += result.failed;
    }
    checked += data.length;
    cursor = data[data.length - 1].email;
  }
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", checked, failed }));
  if (failed) process.exitCode = 1;
}
main().catch(() => { console.error("Newsletter reconciliation failed; check server configuration and provider availability."); process.exitCode = 1; });
