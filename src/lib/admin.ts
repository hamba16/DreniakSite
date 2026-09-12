import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { consumeLimit, requestKey } from "./intake";

export const divisionSchema = z.enum(["engineering", "asset-management"]);
const base = { id: z.string().uuid().optional() };
export const schemas = {
  company_profile: z.object({ ...base, division: divisionSchema.nullable(), story: z.string(), mission: z.string(), vision: z.string(), landing_kicker: z.string(), landing_title: z.string(), landing_description: z.string(), landing_intro_label: z.string(), landing_intro: z.string() }),
  founder: z.object({ ...base, name: z.string().min(1), role: z.string().min(1), portrait_media_id: z.string().uuid().nullable().optional(), story_href: z.string() }),
  company_values: z.object({ ...base, division: divisionSchema.nullable(), name: z.string().min(1), text: z.string(), sort_order: z.number().int() }),
  services: z.object({ ...base, division: divisionSchema.nullable(), name: z.string().min(1), description: z.string(), includes: z.array(z.string()), value: z.string(), editorial_status: z.string(), sort_order: z.number().int() }),
  sectors: z.object({ ...base, division: divisionSchema.nullable(), name: z.string().min(1), description: z.string(), sort_order: z.number().int() }),
  job_openings: z.object({ ...base, division: divisionSchema.nullable(), title: z.string().min(1), location: z.string(), description: z.string(), application_url: z.string().url().or(z.literal("")), is_published: z.boolean() }),
  insights: z.object({ ...base, division: divisionSchema.nullable(), slug: z.string().min(1), title: z.string().min(1), category: z.string(), date: z.string(), summary: z.string(), body: z.array(z.string()), external_url: z.string().url().or(z.literal("")).nullable().optional(), author: z.string(), is_published: z.boolean() }),
  testimonials: z.object({ ...base, division: divisionSchema.nullable(), quote: z.string().min(1), name: z.string().min(1), role: z.string(), is_published: z.boolean() }),
  media: z.object({ ...base, storage_path: z.string().min(1), public_url: z.string().url(), media_type: z.enum(["image", "video"]), alt_text: z.string(), division: divisionSchema.nullable().optional() }),
  social_links: z.object({ ...base, name: z.string().min(1), href: z.string().url(), sort_order: z.number().int() }),
  homepage_content: z.object({ ...base, hero_kicker: z.string(), hero_title: z.string(), hero_subtitle: z.string(), premise_label: z.string(), premise_heading: z.string(), closing_text: z.string() }),
} as const;

export type AdminResource = keyof typeof schemas;

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Authentication required.");
  const { data: admin, error } = await supabase.from("admins").select("id").eq("id", user.id).maybeSingle();
  if (error || !admin) throw new Error("Administrator access required.");
  return { supabase, user };
}

export function checkAdminRateLimit(request: Request, resource: string) {
  if (!consumeLimit(requestKey(request, `admin:${resource}`))) throw new Error("Too many requests.");
}
