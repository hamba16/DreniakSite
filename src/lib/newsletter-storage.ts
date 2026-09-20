import { createClient } from "@supabase/supabase-js";

export type NewsletterSubscriber = {
  email: string;
  subscribed_at: string;
  status: "active" | "unsubscribed";
  source: string;
  consent_version: string;
};

function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase newsletter storage is not configured.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function upsertNewsletterSubscriber(
  subscriber: NewsletterSubscriber,
) {
  const { error } = await database()
    .from("newsletter_subscribers")
    .upsert(subscriber, { onConflict: "email" });
  if (error) throw new Error(`Supabase newsletter upsert failed: ${error.message}`);
}
