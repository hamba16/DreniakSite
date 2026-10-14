import { privateJson } from "@/lib/portal/http";
import { portalClient } from "@/lib/portal/supabase";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return privateJson({ error: "Document is unavailable." }, 404);
  const supabase = await portalClient();
  if (!supabase) return privateJson({ error: "Portal is unavailable." }, 503);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return privateJson({ error: "Please sign in." }, 401);
  const { data: version, error } = await supabase.from("document_versions").select("id, storage_path, filename").eq("id", id).maybeSingle();
  if (error || !version) return privateJson({ error: "Document is unavailable." }, 404);
  const { error: auditError } = await supabase.rpc("portal_log_document_event", { p_action: "document.download", p_version_id: version.id });
  if (auditError) return privateJson({ error: "Document access could not be recorded." }, 503);
  const { data: link, error: storageError } = await supabase.storage.from("portal-files").createSignedUrl(version.storage_path, 60, { download: version.filename });
  if (storageError || !link) return privateJson({ error: "Document is temporarily unavailable." }, 503);
  return new Response(null, {
    status: 302,
    headers: {
      Location: link.signedUrl,
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
