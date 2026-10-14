import { z } from "zod";
import { consumePublicLimit } from "@/lib/public-rate-limit";
import { privateJson, readPortalJson } from "@/lib/portal/http";
import { checkPortalStaff } from "@/lib/portal/staff";
import { portalAdminClient } from "@/lib/portal/supabase";
import { requestKey } from "@/lib/intake";

const inputSchema = z.object({
  organisationId: z.string().uuid(),
  division: z.enum(["engineering", "asset-management"]),
  name: z.string().trim().min(1).max(200),
  stage: z.enum(["discovery", "planning", "delivery", "monitoring", "complete", "paused"]),
  statusText: z.string().trim().max(4000).default(""),
  startDate: z.string().date().optional(),
  targetDate: z.string().date().optional(),
  staffUserId: z.string().uuid().optional(),
});

export async function GET() {
  const staff = await checkPortalStaff();
  if (!staff.ok) return privateJson({ error: "Staff access is unavailable." }, staff.status);
  const supabase = await import("@/lib/portal/supabase").then((m) => m.portalClient());
  if (!supabase) return privateJson({ error: "Portal administration is unavailable." }, 503);
  const { data, error } = await supabase
    .from("engagements")
    .select("id, organisation_id, division, name, stage, status_text, start_date, target_date, organisations(name)")
    .order("updated_at", { ascending: false });
  if (error) return privateJson({ error: "Engagements are temporarily unavailable." }, 503);
  return privateJson({ engagements: data });
}

export async function POST(request: Request) {
  const body = await readPortalJson(request);
  if ("error" in body) return privateJson({ error: body.error }, body.status);
  const parsed = inputSchema.safeParse(body.data);
  if (!parsed.success) return privateJson({ error: "Check the engagement details and try again." }, 400);
  const staff = await checkPortalStaff(true);
  if (!staff.ok) return privateJson({ error: "Staff access is unavailable." }, staff.status);
  const allowed = await consumePublicLimit(requestKey(request, "portal_admin_write"));
  if (allowed === null) return privateJson({ error: "Portal administration is temporarily unavailable." }, 503);
  if (!allowed) return privateJson({ error: "Too many attempts. Try again later." }, 429);
  try {
    const admin = portalAdminClient();
    const { data: entitlement, error: entitlementError } = await admin
      .from("organisation_divisions")
      .select("id")
      .eq("organisation_id", parsed.data.organisationId)
      .eq("division", parsed.data.division)
      .not("confirmed_at", "is", null)
      .maybeSingle();
    if (entitlementError || !entitlement)
      return privateJson({ error: "Confirm this division before creating an engagement." }, 409);
    if (parsed.data.staffUserId) {
      const { data: assigned, error } = await admin.from("portal_staff")
        .select("user_id").eq("user_id", parsed.data.staffUserId).eq("active", true).maybeSingle();
      if (error || !assigned) return privateJson({ error: "The selected staff member is unavailable." }, 400);
    }
    const { data: engagement, error } = await admin.from("engagements").insert({
      organisation_id: parsed.data.organisationId,
      division: parsed.data.division,
      name: parsed.data.name,
      stage: parsed.data.stage,
      status_text: parsed.data.statusText,
      start_date: parsed.data.startDate || null,
      target_date: parsed.data.targetDate || null,
    }).select("id, organisation_id, division, name").single();
    if (error || !engagement) return privateJson({ error: "The engagement could not be created." }, 503);
    if (parsed.data.staffUserId) {
      const { error: assignmentError } = await admin.from("engagement_staff").insert({ engagement_id: engagement.id, user_id: parsed.data.staffUserId, assignment: "lead" });
      if (assignmentError) return privateJson({ error: "The engagement was created, but staff assignment failed." }, 503);
    }
    await admin.from("audit_log").insert({ actor_id: staff.userId, organisation_id: engagement.organisation_id, engagement_id: engagement.id, action: "engagement.created", target_type: "engagement", target_id: engagement.id, metadata: { division: engagement.division } });
    return privateJson({ ok: true, engagement });
  } catch {
    return privateJson({ error: "Portal administration is temporarily unavailable." }, 503);
  }
}
