import { consumePublicLimit } from "@/lib/public-rate-limit";
import { privateJson, portalEmailSchema, readPortalJson } from "@/lib/portal/http";
import { isPortalConfigured, portalClient } from "@/lib/portal/supabase";
import { requestKey } from "@/lib/intake";
import { serverLog } from "@/lib/server-log";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readPortalJson(request);
  if ("error" in body) return privateJson({ error: body.error }, body.status);
  const parsed = portalEmailSchema.safeParse(body.data.email);
  if (!parsed.success)
    return privateJson({ error: "Enter a valid email address." }, 400);

  const allowed = await consumePublicLimit(requestKey(request, "portal_sign_in"));
  if (allowed === null)
    return privateJson({ error: "Sign-in is temporarily unavailable." }, 503);
  if (!allowed)
    return privateJson(
      { error: "Too many attempts. Please wait before trying again." },
      429,
    );
  if (!isPortalConfigured())
    return privateJson({ error: "Portal sign-in is not configured yet." }, 503);

  const supabase = await portalClient();
  if (!supabase)
    return privateJson({ error: "Portal sign-in is not configured yet." }, 503);
  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) serverLog("warn", "portal.sign_in_link_requested", { result: "unavailable" });
  return privateJson({
    ok: true,
    message: "If this address has portal access, a sign-in link will arrive shortly.",
  });
}
