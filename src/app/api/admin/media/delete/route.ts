import { NextResponse } from "next/server";
import { checkAdminRateLimit, requireAdmin } from "@/lib/admin";

export async function DELETE(request: Request) {
  try {
    checkAdminRateLimit(request, "media-delete");
    const { supabase } = await requireAdmin();
    const { id } = await request.json();
    const { data: media, error: readError } = await supabase.from("media").select("storage_path,media_type").eq("id", id).single();
    if (readError) throw readError;
    const bucket = media.media_type === "image" ? "media-images" : "media-videos";
    const { error: storageError } = await supabase.storage.from(bucket).remove([media.storage_path]);
    if (storageError) throw storageError;
    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed." }, { status: 403 });
  }
}
