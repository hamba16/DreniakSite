import { consumePublicLimit } from "@/lib/public-rate-limit";
import { requestKey } from "@/lib/intake";
import { privateJson } from "@/lib/portal/http";
import { portalAdminClient, portalClient } from "@/lib/portal/supabase";

export async function GET(request: Request) {
  const allowed = await consumePublicLimit(requestKey(request, "portal_data_export"));
  if (allowed === null) return privateJson({ error: "Export is temporarily unavailable." }, 503);
  if (!allowed) return privateJson({ error: "Too many export requests. Try again later." }, 429);
  const supabase = await portalClient();
  if (!supabase) return privateJson({ error: "Portal is unavailable." }, 503);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return privateJson({ error: "Please sign in." }, 401);
  const [profile, memberships, onboarding, preferences, assessments, privacyRequests, sentMessages, requests, acknowledgements, paymentReferences, documents, invoices] = await Promise.all([
    supabase.from("portal_profiles").select("full_name, job_title, phone_e164, timezone, currency, created_at").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("organisation_members").select("role, created_at, organisations(name)").eq("user_id", auth.user.id),
    supabase.from("onboarding_state").select("current_step, category_request, privacy_version, privacy_accepted_at, completed_at").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("notification_preferences").select("email_enabled, whatsapp_enabled, event_types, whatsapp_consent_version, whatsapp_consented_at").eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("maturity_assessments").select("answers, score, created_at").eq("user_id", auth.user.id),
    supabase.from("privacy_requests").select("request_type, status, note, created_at, completed_at").eq("user_id", auth.user.id),
    supabase.from("messages").select("body, created_at, threads(subject)").eq("sender_id", auth.user.id).is("deleted_at", null),
    supabase.from("requests").select("request_type, title, body, status, created_at").eq("created_by", auth.user.id).is("deleted_at", null),
    supabase.from("document_acknowledgements").select("action,note,created_at,document_versions(filename,version_number,documents(title))").eq("user_id",auth.user.id),
    supabase.from("payment_reference_notes").select("reference,note,status,created_at,invoices(invoice_number,currency,total_minor)").eq("user_id",auth.user.id),
    supabase.from("documents").select("title,document_type,created_at,document_versions(version_number,filename,mime_type,size_bytes,created_at)").eq("visibility","client").is("deleted_at",null),
    supabase.from("invoices").select("invoice_number,status,currency,subtotal_minor,tax_minor,total_minor,issued_at,due_date,invoice_items(description,quantity_milli,line_subtotal_minor,line_tax_minor),invoice_payments(amount_minor,currency,paid_at,reference)").neq("status","draft").is("deleted_at",null),
  ]);
  const results = [profile, memberships, onboarding, preferences, assessments, privacyRequests, sentMessages, requests, acknowledgements, paymentReferences, documents, invoices];
  if (results.some((result) => result.error)) return privateJson({ error: "Some of your information could not be exported." }, 503);
  try {
    await portalAdminClient().from("audit_log").insert({ actor_id: auth.user.id, action: "privacy.export_downloaded", target_type: "account", target_id: auth.user.id, metadata: {} });
  } catch {
    return privateJson({ error: "The export could not be securely recorded." }, 503);
  }
  const payload = {
    generatedAt: new Date().toISOString(),
    account: { email: auth.user.email, createdAt: auth.user.created_at },
    profile: profile.data,
    memberships: memberships.data,
    onboarding: onboarding.data,
    notificationPreferences: preferences.data,
    maturityAssessments: assessments.data,
    privacyRequests: privacyRequests.data,
    messagesSent: sentMessages.data,
    serviceRequests: requests.data,
    documentAcknowledgements: acknowledgements.data,
    paymentReferences: paymentReferences.data,
    clientVisibleDocuments: documents.data,
    issuedInvoices: invoices.data,
    note: "This export contains account data visible to this signed-in user. It excludes private file contents, other users' messages and internal Dreniak records.",
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="dreniak-portal-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
