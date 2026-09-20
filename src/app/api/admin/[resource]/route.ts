import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { checkAdminRateLimit, requireAdmin, schemas, type AdminResource } from "@/lib/admin";

function resourceName(value: string): AdminResource | null {
  return Object.hasOwn(schemas, value) ? (value as AdminResource) : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const resource = resourceName((await params).resource);
  if (!resource) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.from(resource as never).select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 403 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const resource = resourceName((await params).resource);
  if (!resource) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  try {
    checkAdminRateLimit(request, resource);
    const { supabase } = await requireAdmin();
    const parsed = schemas[resource].safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const record = { ...parsed.data };
    delete record.id;
    const { data, error } = await supabase.from(resource as never).insert(record as never).select().single();
    if (error) throw error;
    revalidateTag("public-content", "max");
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 403 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const resource = resourceName((await params).resource);
  if (!resource) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  try {
    checkAdminRateLimit(request, resource);
    const { supabase } = await requireAdmin();
    const body = await request.json();
    const parsed = schemas[resource].safeParse(body);
    if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: "A valid id and payload are required." }, { status: 400 });
    const { id, ...record } = parsed.data;
    const { data, error } = await supabase.from(resource as never).update(record as never).eq("id", id).select().single();
    if (error) throw error;
    revalidateTag("public-content", "max");
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 403 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const resource = resourceName((await params).resource);
  if (!resource) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  try {
    checkAdminRateLimit(request, resource);
    const { supabase } = await requireAdmin();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "An id is required." }, { status: 400 });
    const { error } = await supabase.from(resource as never).delete().eq("id", id);
    if (error) throw error;
    revalidateTag("public-content", "max");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed." }, { status: 403 });
  }
}
