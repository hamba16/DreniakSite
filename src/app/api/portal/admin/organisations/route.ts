import { z } from "zod";
import { consumePublicLimit } from "@/lib/public-rate-limit";
import { privateJson, readPortalJson } from "@/lib/portal/http";
import { checkPortalStaff } from "@/lib/portal/staff";
import { portalAdminClient } from "@/lib/portal/supabase";
import { requestKey } from "@/lib/intake";

const divisionSchema = z.enum(["engineering", "asset-management"]);
const inputSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), name: z.string().trim().min(1).max(200), divisions: z.array(divisionSchema).max(2) }),
  z.object({ action: z.literal("confirm_category"), userId: z.string().uuid(), category: z.enum(["engineering", "asset-management", "both"]) }),
]);

export async function GET() {
  const staff = await checkPortalStaff(true);
  if (!staff.ok) return privateJson({ error: "Staff access is unavailable." }, staff.status);
  try {
    const admin = portalAdminClient();
    const [organisations, invitations, onboarding] = await Promise.all([
      admin.from("organisations").select("id, name, organisation_divisions(division, confirmed_at), organisation_members(id)").is("deleted_at", null).order("name"),
      admin.from("invitations").select("id, organisation_id, email, role, expires_at, accepted_at, revoked_at, organisations(name)").order("created_at", { ascending: false }).limit(100),
      admin.from("onboarding_state").select("user_id, organisation_id, category_request, current_step, completed_at, organisations(name)").not("category_request", "is", null).is("completed_at", null).order("updated_at", { ascending: false }),
    ]);
    if (organisations.error || invitations.error || onboarding.error)
      return privateJson({ error: "Portal administration data is unavailable." }, 503);
    return privateJson({ organisations: organisations.data, invitations: invitations.data, categoryRequests: onboarding.data });
  } catch {
    return privateJson({ error: "Portal administration data is unavailable." }, 503);
  }
}

export async function POST(request: Request) {
  const body = await readPortalJson(request);
  if ("error" in body) return privateJson({ error: body.error }, body.status);
  const parsed = inputSchema.safeParse(body.data);
  if (!parsed.success) return privateJson({ error: "Check the organisation details and try again." }, 400);
  const staff = await checkPortalStaff(true);
  if (!staff.ok) return privateJson({ error: "Staff access is unavailable." }, staff.status);
  const allowed = await consumePublicLimit(requestKey(request, "portal_admin_write"));
  if (allowed === null) return privateJson({ error: "Portal administration is temporarily unavailable." }, 503);
  if (!allowed) return privateJson({ error: "Too many attempts. Try again later." }, 429);
  try {
    const admin = portalAdminClient();
    if (parsed.data.action === "create") {
      const { data: organisation, error } = await admin
        .from("organisations")
        .insert({ name: parsed.data.name })
        .select("id, name")
        .single();
      if (error || !organisation) return privateJson({ error: "The organisation could not be created." }, 503);
      if (parsed.data.divisions.length) {
        const { error: divisionError } = await admin.from("organisation_divisions").insert(
          parsed.data.divisions.map((division) => ({ organisation_id: organisation.id, division, confirmed_by: staff.userId, confirmed_at: new Date().toISOString() })),
        );
        if (divisionError) return privateJson({ error: "The organisation was created, but its access could not be saved." }, 503);
      }
      await admin.from("audit_log").insert({ actor_id: staff.userId, organisation_id: organisation.id, action: "organisation.created", target_type: "organisation", target_id: organisation.id, metadata: { division_count: parsed.data.divisions.length } });
      return privateJson({ ok: true, organisation });
    }

    const { data: state, error: stateError } = await admin
      .from("onboarding_state")
      .select("organisation_id")
      .eq("user_id", parsed.data.userId)
      .maybeSingle();
    if (stateError || !state) return privateJson({ error: "The category request could not be found." }, 404);
    const divisions = parsed.data.category === "both"
      ? ["engineering", "asset-management"]
      : [parsed.data.category];
    const confirmedAt = new Date().toISOString();
    const { error: divisionError } = await admin.from("organisation_divisions").upsert(
      divisions.map((division) => ({ organisation_id: state.organisation_id, division, confirmed_by: staff.userId, confirmed_at: confirmedAt })),
      { onConflict: "organisation_id,division" },
    );
    if (divisionError) return privateJson({ error: "The category could not be confirmed." }, 503);
    const { error: clearError } = await admin.from("onboarding_state").update({ category_request: null }).eq("user_id", parsed.data.userId);
    if (clearError) return privateJson({ error: "The division was confirmed, but the request state could not be updated." }, 503);
    await admin.from("audit_log").insert({ actor_id: staff.userId, organisation_id: state.organisation_id, action: "organisation.category_confirmed", target_type: "onboarding", target_id: parsed.data.userId, metadata: { category: parsed.data.category } });
    return privateJson({ ok: true });
  } catch {
    return privateJson({ error: "Portal administration is temporarily unavailable." }, 503);
  }
}
