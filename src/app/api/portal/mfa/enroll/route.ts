import { consumePublicLimit } from "@/lib/public-rate-limit";
import { checkPortalStaff } from "@/lib/portal/staff";
import { privateJson, readPortalJson } from "@/lib/portal/http";
import { portalClient } from "@/lib/portal/supabase";
import { requestKey } from "@/lib/intake";

export async function GET() {
  const staff = await checkPortalStaff(false, false);
  if (!staff.ok) return privateJson({ error: "Staff access is unavailable." }, staff.status);
  const supabase = await portalClient();
  if (!supabase) return privateJson({ error: "MFA status is unavailable." }, 503);
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) return privateJson({ error: "MFA status is unavailable." }, 503);
  return privateJson({
    factors: data.totp.filter((factor) => factor.status === "verified").map((factor) => ({ id: factor.id, friendlyName: factor.friendly_name })),
  });
}

export async function POST(request: Request) {
  const body = await readPortalJson(request);
  if ("error" in body) return privateJson({ error: body.error }, body.status);
  const staff = await checkPortalStaff(false, false);
  if (!staff.ok) return privateJson({ error: "Staff access is unavailable." }, staff.status);
  const allowed = await consumePublicLimit(requestKey(request, "portal_mfa"));
  if (allowed === null) return privateJson({ error: "MFA setup is temporarily unavailable." }, 503);
  if (!allowed) return privateJson({ error: "Too many attempts. Try again later." }, 429);
  const supabase = await portalClient();
  if (!supabase) return privateJson({ error: "MFA setup is unavailable." }, 503);
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Dreniak Portal",
  });
  if (error) return privateJson({ error: "An authenticator could not be enrolled." }, 400);
  return privateJson({
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  });
}
