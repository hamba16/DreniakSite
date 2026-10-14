import "server-only";
import { portalClient } from "./supabase";

export type PortalStaffRole = "dreniak_engineer" | "dreniak_admin";
export type StaffCheck =
  | { ok: true; userId: string; role: PortalStaffRole }
  | { ok: false; status: 401 | 403 | 503 };

export async function checkPortalStaff(
  adminOnly = false,
  requireMfa = true,
): Promise<StaffCheck> {
  const supabase = await portalClient();
  if (!supabase) return { ok: false, status: 503 };
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) return { ok: false, status: 503 };
  if (!auth.user) return { ok: false, status: 401 };
  const { data, error } = await supabase
    .from("portal_staff")
    .select("role, active")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) return { ok: false, status: 503 };
  if (
    !data?.active ||
    (data.role !== "dreniak_admin" && data.role !== "dreniak_engineer") ||
    (adminOnly && data.role !== "dreniak_admin")
  )
    return { ok: false, status: 403 };
  if (requireMfa) {
    const { data: aal, error: mfaError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaError) return { ok: false, status: 503 };
    if (aal.currentLevel !== "aal2") return { ok: false, status: 403 };
  }
  return { ok: true, userId: auth.user.id, role: data.role };
}
