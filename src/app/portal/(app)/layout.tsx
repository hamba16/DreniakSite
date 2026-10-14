import { redirect } from "next/navigation";
import { PortalMfaGate } from "@/components/portal-mfa";
import { PortalShell } from "@/components/portal-shell";
import { getPortalSession, hasStaffAal2 } from "@/lib/portal/access";
import { portalClient } from "@/lib/portal/supabase";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();
  if (session.state === "unconfigured") redirect("/portal?status=unavailable");
  if (session.state === "signed-out") redirect("/portal");
  if (session.state === "unavailable") redirect("/portal?status=unavailable");
  if (session.state === "denied") redirect("/portal?status=access");
  const identity = session.identity;
  if (!identity.staffRole && !identity.onboardingComplete) redirect("/portal/onboarding");
  if (identity.staffRole && !(await hasStaffAal2())) return <PortalMfaGate />;

  let divisions: string[] = [];
  const supabase = await portalClient();
  if (supabase) {
    if (identity.memberships.length) {
      const { data } = await supabase
        .from("organisation_divisions")
        .select("division")
        .in("organisation_id", identity.memberships.map((membership) => membership.organisation_id))
        .not("confirmed_at", "is", null);
      divisions = (data || []).map((row) => row.division);
    }
    if (identity.staffRole) {
      const { data } = await supabase.from("engagements").select("division").limit(1000);
      divisions.push(...(data || []).map((row) => row.division));
    }
    divisions = Array.from(new Set(divisions));
  }
  return <PortalShell name={identity.memberships[0]?.organisations?.name || (identity.staffRole ? "Dreniak staff" : "Client workspace")} divisions={divisions} staff={Boolean(identity.staffRole)}>{children}</PortalShell>;
}
