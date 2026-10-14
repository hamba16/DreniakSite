import { z } from "zod";
import { consumePublicLimit } from "@/lib/public-rate-limit";
import { requestKey } from "@/lib/intake";
import { privateJson, readPortalJson } from "@/lib/portal/http";
import { portalAdminClient, portalClient } from "@/lib/portal/supabase";
const schema = z.object({ invoiceId: z.string().uuid(), reference: z.string().trim().min(1).max(200), note: z.string().trim().max(1000).default("") });
export async function POST(request: Request) {
  const body = await readPortalJson(request);
  if ("error" in body) return privateJson({ error: body.error }, body.status);
  const parsed = schema.safeParse(body.data);
  if (!parsed.success) return privateJson({ error: "Enter a valid payment reference." }, 400);
  const allowed = await consumePublicLimit(requestKey(request, "portal_payment_reference"));
  if (allowed === null) return privateJson({ error: "Payment reference service is unavailable." }, 503);
  if (!allowed) return privateJson({ error: "Too many submissions. Try again later." }, 429);
  const supabase = await portalClient();
  if (!supabase) return privateJson({ error: "Portal is unavailable." }, 503);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return privateJson({ error: "Please sign in." }, 401);
  const { data: invoice } = await supabase.from("invoices").select("id, engagement_id").eq("id", parsed.data.invoiceId).maybeSingle();
  if (!invoice) return privateJson({ error: "Invoice is unavailable." }, 404);
  const { data, error } = await supabase.from("payment_reference_notes").insert({ invoice_id: invoice.id, user_id: auth.user.id, reference: parsed.data.reference, note: parsed.data.note }).select("id").single();
  if (error) return privateJson({ error: "The reference could not be recorded." }, 400);
  try {
    const admin = portalAdminClient();
    const { error: auditError } = await admin.from("audit_log").insert({ actor_id: auth.user.id, engagement_id: invoice.engagement_id, action: "payment.reference_submitted", target_type: "payment_reference", target_id: data.id, metadata: {} });
    if (auditError) {
      await admin.from("payment_reference_notes").delete().eq("id", data.id);
      return privateJson({ error: "The reference could not be securely recorded." }, 503);
    }
  } catch { return privateJson({ error: "The reference could not be securely recorded." }, 503); }
  return privateJson({ ok: true });
}
