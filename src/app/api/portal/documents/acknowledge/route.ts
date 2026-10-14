import { z } from "zod";
import { privateJson, readPortalJson } from "@/lib/portal/http";
import { portalClient } from "@/lib/portal/supabase";
const schema = z.object({ versionId: z.string().uuid(), note: z.string().trim().max(1000).default("") });
export async function POST(request: Request) {
  const body = await readPortalJson(request);
  if ("error" in body) return privateJson({ error: body.error }, body.status);
  const parsed = schema.safeParse(body.data);
  if (!parsed.success) return privateJson({ error: "The acknowledgement could not be submitted." }, 400);
  const supabase = await portalClient();
  if (!supabase) return privateJson({ error: "Portal is unavailable." }, 503);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return privateJson({ error: "Please sign in." }, 401);
  const { data: version, error } = await supabase.from("document_versions").select("id, documents!inner(requires_acknowledgement)").eq("id", parsed.data.versionId).maybeSingle();
  if (error || !version || !version.documents[0]?.requires_acknowledgement) return privateJson({ error: "This document does not accept acknowledgements." }, 404);
  const { error: insertError } = await supabase.from("document_acknowledgements").insert({ document_version_id: version.id, user_id: auth.user.id, action: "acknowledge", note: parsed.data.note });
  if (insertError?.code === "23505") return privateJson({ ok: true, alreadyAcknowledged: true });
  if (insertError) return privateJson({ error: "The acknowledgement could not be saved." }, 503);
  return privateJson({ ok: true });
}
