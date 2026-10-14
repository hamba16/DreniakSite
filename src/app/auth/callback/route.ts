import { NextResponse } from "next/server";
import { acceptPortalInvitation } from "@/lib/portal/invitations";
import { portalClient } from "@/lib/portal/supabase";

function toPortal(request: Request, destination: string) {
  return NextResponse.redirect(new URL(destination, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const invitationId = url.searchParams.get("invite");
  const supabase = await portalClient();
  if (!supabase || !code) return toPortal(request, "/portal?status=unavailable");

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return toPortal(request, "/portal?status=link-expired");
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return toPortal(request, "/portal?status=unavailable");

  if (invitationId) {
    if (!/^[0-9a-f-]{36}$/i.test(invitationId) || !data.user.email)
      return toPortal(request, "/portal?status=invite-invalid");
    try {
      await acceptPortalInvitation(invitationId, data.user.id, data.user.email);
    } catch {
      return toPortal(request, "/portal?status=invite-invalid");
    }
  }

  const { error: auditError } = await supabase.rpc("portal_log_sign_in");
  if (auditError) return toPortal(request, "/portal?status=unavailable");
  return toPortal(request, "/portal/onboarding");
}
