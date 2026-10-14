import "server-only";
import type { User } from "@supabase/supabase-js";
import { portalClient } from "./supabase";

export type PortalIdentity = {
  user: User;
  staffRole: "dreniak_engineer" | "dreniak_admin" | null;
  memberships: Array<{
    organisation_id: string;
    role: "client_admin" | "client_member";
    organisations: { id: string; name: string } | null;
  }>;
  onboardingComplete: boolean;
  currentStep: number;
};

export type PortalSession =
  | { state: "unconfigured" }
  | { state: "signed-out" }
  | { state: "unavailable" }
  | { state: "denied"; user: User }
  | { state: "ready"; identity: PortalIdentity };

export async function getPortalSession(): Promise<PortalSession> {
  const supabase = await portalClient();
  if (!supabase) return { state: "unconfigured" };
  const { data, error } = await supabase.auth.getUser();
  if (error) return { state: "unavailable" };
  if (!data.user) return { state: "signed-out" };

  const [staffResult, membershipResult, onboardingResult] = await Promise.all([
    supabase
      .from("portal_staff")
      .select("role, active")
      .eq("user_id", data.user.id)
      .maybeSingle(),
    supabase
      .from("organisation_members")
      .select("organisation_id, role, organisations(id, name)")
      .eq("user_id", data.user.id),
    supabase
      .from("onboarding_state")
      .select("current_step, completed_at")
      .eq("user_id", data.user.id)
      .maybeSingle(),
  ]);
  if (staffResult.error || membershipResult.error || onboardingResult.error)
    return { state: "unavailable" };

  const staffRole =
    staffResult.data?.active &&
    (staffResult.data.role === "dreniak_admin" ||
      staffResult.data.role === "dreniak_engineer")
      ? staffResult.data.role
      : null;
  const memberships = membershipResult.data ?? [];
  if (!staffRole && memberships.length === 0)
    return { state: "denied", user: data.user };

  return {
    state: "ready",
    identity: {
      user: data.user,
      staffRole,
      memberships: memberships.map((membership) => ({
        organisation_id: membership.organisation_id,
        role: membership.role,
        organisations: membership.organisations?.[0] ?? null,
      })),
      onboardingComplete: Boolean(onboardingResult.data?.completed_at),
      currentStep: onboardingResult.data?.current_step ?? 1,
    },
  };
}

export async function hasStaffAal2() {
  const supabase = await portalClient();
  if (!supabase) return false;
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return !error && data.currentLevel === "aal2";
}
