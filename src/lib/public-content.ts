import { createClient } from "@/utils/supabase/server";
import type { Division } from "./site";

export interface PublicCompanyProfile {
  story: string;
  mission: string;
  vision: string;
  landing_kicker: string;
  landing_title: string;
  landing_description: string;
  landing_intro_label: string;
  landing_intro: string;
}

export interface PublicService {
  name: string;
  description: string;
  includes: string[];
  value: string;
  editorial_status: string;
}

export interface PublishedInsight {
  slug: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  body: string[];
  externalUrl?: string;
  author: string;
}

export async function publishedRows<T>(table: string, division: Division) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).select("*").eq("division", division).order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []) as T[];
}

export async function publicCompanyProfile(division: Division) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("company_profile").select("*").eq("division", division).maybeSingle();
  if (error) throw error;
  return data as PublicCompanyProfile | null;
}

export async function publicServices(division: Division) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").select("name,description,includes,value,editorial_status").eq("division", division).order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []) as PublicService[];
}

export async function homepageContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("homepage_content").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error) throw error;
  return data as { hero_kicker: string; hero_title: string; hero_subtitle: string; premise_label: string; premise_heading: string; closing_text: string } | null;
}

export async function publishedMedia(division: Division) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("media").select("id,public_url,alt_text,media_type").eq("division", division).eq("media_type", "image").order("uploaded_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function publishedInsights(division: Division): Promise<PublishedInsight[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("insights").select("*").eq("division", division).eq("is_published", true).order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map((item): PublishedInsight => ({
    slug: item.slug,
    title: item.title,
    category: item.category,
    date: item.date,
    summary: item.summary,
    body: Array.isArray(item.body) ? item.body.map(String) : [],
    externalUrl: item.external_url || undefined,
    author: item.author,
  }));
}
