import { privateJson } from "@/lib/portal/http";
import { portalClient } from "@/lib/portal/supabase";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    return privateJson({ error: "This request could not be accepted." }, 403);
  const supabase = await portalClient();
  if (!supabase) return privateJson({ error: "Portal sign-out is unavailable." }, 503);
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) return privateJson({ error: "Portal sign-out is unavailable." }, 503);
  return privateJson({ ok: true });
}
