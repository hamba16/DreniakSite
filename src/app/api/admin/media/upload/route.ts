import { NextResponse } from "next/server";
import { checkAdminRateLimit, requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    checkAdminRateLimit(request, "media-upload");
    const { supabase } = await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    const mediaType = form.get("media_type");
    if (!(file instanceof File) || (mediaType !== "image" && mediaType !== "video")) {
      return NextResponse.json({ error: "A file and media_type are required." }, { status: 400 });
    }
    const bucket = mediaType === "image" ? "media-images" : "media-videos";
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    const { data, error } = await supabase.from("media").insert({
      storage_path: path,
      public_url: publicData.publicUrl,
      media_type: mediaType,
      alt_text: String(form.get("alt_text") || ""),
      division: form.get("division") || null,
    }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 403 });
  }
}
