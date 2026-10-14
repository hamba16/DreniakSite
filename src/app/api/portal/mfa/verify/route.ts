import { z } from "zod";
import { consumePublicLimit } from "@/lib/public-rate-limit";
import { checkPortalStaff } from "@/lib/portal/staff";
import { privateJson, readPortalJson } from "@/lib/portal/http";
import { portalClient } from "@/lib/portal/supabase";
import { requestKey } from "@/lib/intake";

const inputSchema = z.object({ factorId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request) {
  const body = await readPortalJson(request);
  if ("error" in body) return privateJson({ error: body.error }, body.status);
  const parsed = inputSchema.safeParse(body.data);
  if (!parsed.success) return privateJson({ error: "Enter the six-digit authenticator code." }, 400);
  const staff = await checkPortalStaff(false, false);
  if (!staff.ok) return privateJson({ error: "Staff access is unavailable." }, staff.status);
  const allowed = await consumePublicLimit(requestKey(request, "portal_mfa_verify"));
  if (allowed === null) return privateJson({ error: "MFA verification is temporarily unavailable." }, 503);
  if (!allowed) return privateJson({ error: "Too many attempts. Try again later." }, 429);
  const supabase = await portalClient();
  if (!supabase) return privateJson({ error: "MFA verification is unavailable." }, 503);
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: parsed.data.factorId });
  if (challengeError) return privateJson({ error: "The code could not be verified." }, 400);
  const { error } = await supabase.auth.mfa.verify({
    factorId: parsed.data.factorId,
    challengeId: challenge.id,
    code: parsed.data.code,
  });
  if (error) return privateJson({ error: "The code is invalid or expired." }, 400);
  return privateJson({ ok: true });
}
