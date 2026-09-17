import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  assetManagementFeaturedProjects,
  type ProjectCaseStudy,
} from "@/content/project-case-studies";
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

export type PublishedCaseStudy = ProjectCaseStudy;

function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.",
    );
  }
  return createSupabaseClient(url, key);
}

const publicSupabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? getPublicClient()
    : null;

function requirePublicClient() {
  if (!publicSupabase) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required.",
    );
  }
  return publicSupabase;
}

const cachedPublishedRows = unstable_cache(
  async <T>(table: string, division: Division) => {
    const supabase = requirePublicClient();
    const { data, error } = await supabase.from(table).select("*").eq("division", division).order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []) as T[];
  },
  ["public-rows"],
  { tags: ["public-content"], revalidate: 3600 },
);

export const publishedRows = cache(function publishedRows<T>(table: string, division: Division) {
  return cachedPublishedRows<T>(table, division);
});

const cachedPublicCompanyProfile = unstable_cache(
  async (division: Division) => {
    const supabase = requirePublicClient();
    const { data, error } = await supabase.from("company_profile").select("*").eq("division", division).maybeSingle();
    if (error) throw error;
    return data as PublicCompanyProfile | null;
  },
  ["public-company-profile"],
  { tags: ["public-content"], revalidate: 3600 },
);

export const publicCompanyProfile = cache((division: Division) =>
  cachedPublicCompanyProfile(division),
);

const cachedPublicServices = unstable_cache(
  async (division: Division) => {
    const supabase = requirePublicClient();
    const { data, error } = await supabase.from("services").select("name,description,includes,value,editorial_status").eq("division", division).order("sort_order", { ascending: true });
    if (error) throw error;
    return (data || []) as PublicService[];
  },
  ["public-services"],
  { tags: ["public-content"], revalidate: 3600 },
);

export const publicServices = cache((division: Division) =>
  cachedPublicServices(division),
);

const cachedHomepageContent = unstable_cache(
  async () => {
    const supabase = requirePublicClient();
    const { data, error } = await supabase.from("homepage_content").select("*").order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (error) throw error;
    return data as { hero_kicker: string; hero_title: string; hero_subtitle: string; premise_label: string; premise_heading: string; closing_text: string } | null;
  },
  ["homepage-content"],
  { tags: ["public-content"], revalidate: 3600 },
);

export const homepageContent = cache(() => cachedHomepageContent());

const cachedPublishedMedia = unstable_cache(
  async (division: Division) => {
    const supabase = requirePublicClient();
    const { data, error } = await supabase.from("media").select("id,public_url,alt_text,media_type").eq("division", division).eq("media_type", "image").order("uploaded_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },
  ["published-media"],
  { tags: ["public-content"], revalidate: 3600 },
);

export const publishedMedia = cache((division: Division) =>
  cachedPublishedMedia(division),
);

const cachedPublishedInsights = unstable_cache(
  async (division: Division): Promise<PublishedInsight[]> => {
    const supabase = requirePublicClient();
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
  },
  ["published-insights"],
  { tags: ["public-content"], revalidate: 900 },
);

export const publishedInsights = cache((division: Division) =>
  cachedPublishedInsights(division),
);

const cachedPublishedCaseStudies = unstable_cache(
  async (division: Division): Promise<PublishedCaseStudy[]> => {
    if (division !== "asset-management") return [];

    const supabase = requirePublicClient();
    const { data, error } = await supabase
      .from("case_studies")
      .select("*")
      .eq("division", division)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return ((data || []) as PublishedCaseStudy[]).map((item) => ({
      ...item,
      sections: Array.isArray(item.sections) ? item.sections : [],
      serviceLinks: Array.isArray(item.serviceLinks) ? item.serviceLinks : undefined,
    }));
  },
  ["published-case-studies"],
  { tags: ["public-content"], revalidate: 900 },
);

export const publishedCaseStudies = cache(async (division: Division) => {
  try {
    return await cachedPublishedCaseStudies(division);
  } catch {
    return assetManagementFeaturedProjects.filter((item) => item.isPublished);
  }
});
