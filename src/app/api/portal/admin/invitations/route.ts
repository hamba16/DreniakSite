import { z } from "zod";
import { consumePublicLimit } from "@/lib/public-rate-limit";
import { privateJson, portalEmailSchema, readPortalJson } from "@/lib/portal/http";
import { checkPortalStaff } from "@/lib/portal/staff";
import { portalAdminClient } from "@/lib/portal/supabase";
import { requestKey } from "@/lib/intake";

const createSchema = z.object({
  action: z.literal("create"),
  organisationId: z.string().uuid(),
  email: portalEmailSchema,
  role: z.enum(["client_admin", "client_member"]),
});
const revokeSchema = z.object({ action: z.literal("revoke"), invitationId: z.string().uuid() });
const inputSchema = z.discriminatedUnion("action", [createSchema, revokeSchema]);

export async function POST(request: Request) {
  const body = await readPortalJson(request);
  if ("error" in body) return privateJson({ error: body.error }, body.status);
  const parsed = inputSchema.safeParse(body.data);
  if (!parsed.success) return privateJson({ error: "Check the invitation details and try again." }, 400);
  const staff = await checkPortalStaff(true);
  if (!staff.ok) return privateJson({ error: "Staff access is unavailable." }, staff.status);
  const allowed = await consumePublicLimit(requestKey(request, "portal_invitation"));
  if (allowed === null) return privateJson({ error: "Invitations are temporarily unavailable." }, 503);
  if (!allowed) return privateJson({ error: "Too many attempts. Try again later." }, 429);

  try {
    const admin = portalAdminClient();
    if (parsed.data.action === "revoke") {
      const { data, error } = await admin
        .from("invitations")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", parsed.data.invitationId)
        .is("accepted_at", null)
        .is("revoked_at", null)
        .select("id, organisation_id")
        .maybeSingle();
      if (error) return privateJson({ error: "The invitation could not be revoked." }, 503);
      if (!data) return privateJson({ error: "This invitation is no longer active." }, 409);
      await admin.from("audit_log").insert({
        actor_id: staff.userId,
        organisation_id: data.organisation_id,
        action: "invite.revoked",
        target_type: "invitation",
        target_id: data.id,
        metadata: {},
      });
      return privateJson({ ok: true });
    }

    const { data: organisation, error: organisationError } = await admin
      .from("organisations")
      .select("id")
      .eq("id", parsed.data.organisationId)
      .is("deleted_at", null)
      .maybeSingle();
    if (organisationError || !organisation)
      return privateJson({ error: "The selected organisation is unavailable." }, 404);

    const { data: invitation, error: inviteError } = await admin
      .from("invitations")
      .insert({
        organisation_id: organisation.id,
        email: parsed.data.email,
        role: parsed.data.role,
        invited_by: staff.userId,
      })
      .select("id, expires_at")
      .single();
    if (inviteError || !invitation)
      return privateJson({ error: "The invitation could not be created." }, 503);

    const redirectTo = `${new URL(request.url).origin}/auth/callback?invite=${invitation.id}`;
    const { error: emailError } = await admin.auth.admin.inviteUserByEmail(
      parsed.data.email,
      { redirectTo },
    );
    if (emailError) {
      await admin
        .from("invitations")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", invitation.id);
      return privateJson({ error: "The invitation email could not be sent." }, 502);
    }
    await admin.from("audit_log").insert({
      actor_id: staff.userId,
      organisation_id: organisation.id,
      action: "invite.created",
      target_type: "invitation",
      target_id: invitation.id,
      metadata: { role: parsed.data.role },
    });
    return privateJson({ ok: true, invitationId: invitation.id, expiresAt: invitation.expires_at });
  } catch {
    return privateJson({ error: "Invitations are temporarily unavailable." }, 503);
  }
}
