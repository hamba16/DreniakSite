import "server-only";
import { portalAdminClient } from "./supabase";

export async function acceptPortalInvitation(
  invitationId: string,
  userId: string,
  email: string,
) {
  const admin = portalAdminClient();
  const { error } = await admin.rpc("portal_accept_invitation", {
    p_invitation_id: invitationId,
    p_user_id: userId,
    p_email: email.toLowerCase(),
  });
  if (error) throw new Error("Portal invitation could not be accepted.");
}
