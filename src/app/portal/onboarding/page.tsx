import { redirect } from "next/navigation";
import { PortalOnboarding } from "@/components/portal-onboarding";
import { getPortalSession } from "@/lib/portal/access";
import { portalClient } from "@/lib/portal/supabase";
import { defaultPortalPrivacyVersion } from "@/lib/portal/constants";

export const metadata = {
  title: "Set up your workspace — Client Portal",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const session = await getPortalSession();
  if (session.state !== "ready") redirect("/portal?status=access");
  if (session.identity.staffRole) redirect("/portal/dashboard");
  if (session.identity.onboardingComplete) redirect("/portal/dashboard");

  const supabase = await portalClient();
  if (!supabase) redirect("/portal?status=unavailable");
  const userId = session.identity.user.id;
  const [state, profile, preferences, membership] = await Promise.all([
    supabase.from("onboarding_state").select("current_step, category_request").eq("user_id", userId).maybeSingle(),
    supabase.from("portal_profiles").select("full_name, job_title, phone_e164, timezone, currency").eq("user_id", userId).maybeSingle(),
    supabase.from("notification_preferences").select("email_enabled, whatsapp_enabled, event_types").eq("user_id", userId).maybeSingle(),
    supabase.from("organisation_members").select("organisations(name)").eq("user_id", userId).limit(1).maybeSingle(),
  ]);
  if (state.error || profile.error || preferences.error || membership.error)
    redirect("/portal?status=unavailable");

  return (
    <PortalOnboarding
      currentStep={state.data?.current_step ?? 1}
      organisationName={membership.data?.organisations?.[0]?.name ?? "Your organisation"}
      privacyVersion={defaultPortalPrivacyVersion}
      profile={profile.data ?? { full_name: "", job_title: "", phone_e164: null, timezone: "Africa/Kampala", currency: "UGX" }}
      categoryRequest={state.data?.category_request ?? null}
      notifications={preferences.data ?? { email_enabled: true, whatsapp_enabled: false, event_types: [] }}
    />
  );
}
