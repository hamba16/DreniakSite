import { z } from "zod";
import { privateJson, readPortalJson } from "@/lib/portal/http";
import { portalAdminClient, portalClient } from "@/lib/portal/supabase";
import { defaultPortalPrivacyVersion } from "@/lib/portal/constants";

const eventTypes = [
  "new_document",
  "message",
  "milestone_change",
  "invoice_issued",
  "invoice_overdue",
  "supervision_issue",
] as const;

const stepSchema = z.discriminatedUnion("step", [
  z.object({
    step: z.literal(1),
    fullName: z.string().trim().min(2).max(160),
    jobTitle: z.string().trim().min(1).max(160),
    phone: z.string().regex(/^\+[1-9][0-9]{7,14}$/),
  }),
  z.object({
    step: z.literal(2),
    category: z.enum(["engineering", "asset-management", "both"]),
  }),
  z.object({
    step: z.literal(3),
    channel: z.enum(["email", "whatsapp", "both"]),
    eventTypes: z.array(z.enum(eventTypes)).max(eventTypes.length),
    whatsappConsent: z.boolean(),
  }),
  z.object({
    step: z.literal(4),
    timezone: z.enum(["Africa/Kampala", "Europe/London"]),
    currency: z.enum(["UGX", "GBP", "USD"]),
  }),
  z.object({ step: z.literal(5), privacyAccepted: z.literal(true) }),
]);

const privacyVersion = defaultPortalPrivacyVersion;

async function getOnboardingState(supabase: NonNullable<Awaited<ReturnType<typeof portalClient>>>, admin: ReturnType<typeof portalAdminClient>, userId: string) {
  const current = await admin
    .from("onboarding_state")
    .select("user_id, organisation_id, current_step, completed_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (current.error) return { error: true as const };
  if (current.data) return { error: false as const, row: current.data };
  const memberships = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", userId)
    .limit(1);
  const organisationId = memberships.data?.[0]?.organisation_id;
  if (memberships.error || !organisationId) return { error: true as const };
  const created = await admin
    .from("onboarding_state")
    .insert({ user_id: userId, organisation_id: organisationId })
    .select("user_id, organisation_id, current_step, completed_at")
    .single();
  if (created.error || !created.data) return { error: true as const };
  return { error: false as const, row: created.data };
}

export async function POST(request: Request) {
  const body = await readPortalJson(request);
  if ("error" in body) return privateJson({ error: body.error }, body.status);
  const parsed = stepSchema.safeParse(body.data);
  if (!parsed.success)
    return privateJson({ error: "Please check this step and try again." }, 400);

  const supabase = await portalClient();
  if (!supabase) return privateJson({ error: "Portal sign-in is not configured." }, 503);
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) return privateJson({ error: "Portal services are unavailable." }, 503);
  if (!auth.user) return privateJson({ error: "Please sign in to continue." }, 401);

  const admin = portalAdminClient();
  const state = await getOnboardingState(supabase, admin, auth.user.id);
  if (state.error) return privateJson({ error: "Onboarding is temporarily unavailable." }, 503);
  const step = parsed.data.step;
  if (state.row.completed_at || step > state.row.current_step)
    return privateJson({ error: "Complete the earlier steps before continuing." }, 409);

  if (step === 1) {
    const result = await supabase.from("portal_profiles").upsert({
      user_id: auth.user.id,
      full_name: parsed.data.fullName,
      job_title: parsed.data.jobTitle,
      phone_e164: parsed.data.phone,
    });
    if (result.error) return privateJson({ error: "Your profile could not be saved." }, 400);
  } else if (step === 2) {
    const result = await admin
      .from("onboarding_state")
      .update({ category_request: parsed.data.category })
      .eq("user_id", auth.user.id);
    if (result.error) return privateJson({ error: "Your category request could not be saved." }, 400);
  } else if (step === 3) {
    const wantsWhatsApp = parsed.data.channel !== "email";
    const profile = await supabase
      .from("portal_profiles")
      .select("phone_e164")
      .eq("user_id", auth.user.id)
      .maybeSingle();
    if (profile.error) return privateJson({ error: "Your preferences could not be saved." }, 503);
    if (wantsWhatsApp && (!profile.data?.phone_e164 || !parsed.data.whatsappConsent))
      return privateJson({ error: "Add a phone number and explicitly consent to WhatsApp messages." }, 400);
    const result = await admin.from("notification_preferences").upsert({
      user_id: auth.user.id,
      email_enabled: parsed.data.channel !== "whatsapp",
      whatsapp_enabled: wantsWhatsApp,
      event_types: parsed.data.eventTypes,
      whatsapp_consent_version: wantsWhatsApp ? "whatsapp-opt-in-v1" : null,
      whatsapp_consented_at: wantsWhatsApp ? new Date().toISOString() : null,
    });
    if (result.error) return privateJson({ error: "Your preferences could not be saved." }, 400);
  } else if (step === 4) {
    const result = await admin
      .from("portal_profiles")
      .update({ timezone: parsed.data.timezone, currency: parsed.data.currency })
      .eq("user_id", auth.user.id);
    if (result.error) return privateJson({ error: "Your regional preferences could not be saved." }, 400);
  } else {
    const result = await admin
      .from("onboarding_state")
      .update({
        current_step: 5,
        privacy_version: privacyVersion,
        privacy_accepted_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", auth.user.id)
      .select("current_step, completed_at")
      .single();
    if (result.error) return privateJson({ error: "Your acknowledgement could not be saved." }, 400);
    return privateJson({ ok: true, complete: true, currentStep: result.data.current_step });
  }

  const nextStep = Math.max(state.row.current_step, step + 1);
  const result = await admin
    .from("onboarding_state")
    .update({ current_step: nextStep })
    .eq("user_id", auth.user.id);
  if (result.error) return privateJson({ error: "Onboarding could not be saved." }, 503);
  return privateJson({ ok: true, currentStep: nextStep });
}
