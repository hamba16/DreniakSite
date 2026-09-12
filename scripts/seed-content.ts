import { createClient } from "@supabase/supabase-js";
import brief from "../src/content/brief.json";
import { engineering } from "../src/content/engineering";
import { founder } from "../src/content/founder";
import { socialLinks } from "../src/lib/site";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!url || !key || !email || !password) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, ADMIN_EMAIL, and ADMIN_PASSWORD.");
}
const adminEmail = email;
const adminPassword = password;

const supabase = createClient(url, key);
async function run() {
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
  if (authError || !auth.user) throw authError || new Error("Admin sign-in failed.");
  const admin = await supabase.from("admins").select("id").eq("id", auth.user.id).maybeSingle();
  if (admin.error || !admin.data) throw new Error("The signed-in user must first be inserted into public.admins.");

  async function insert(table: string, rows: object[]) {
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw error;
  }

  await supabase.from("company_profile").upsert([
  {
    division: "asset-management", story: brief.story, mission: "", vision: "",
    landing_kicker: "DRENIAK ASSET MANAGEMENT", landing_title: "Infrastructure understood. Value multiplied.",
    landing_description: "A longer view of what you own. A clearer understanding of what it can become.",
    landing_intro_label: "THE VALUE BEYOND THE ASSET",
    landing_intro: "We help organisations understand what they own, maximise how it performs, determine where capital should go, and ensure infrastructure creates value far beyond the asset itself.",
  },
  {
    division: "engineering", story: engineering.description, mission: engineering.mission, vision: engineering.vision,
    landing_kicker: "DRENIAK ENGINEERING", landing_title: "Built with purpose. Delivered with precision.",
    landing_description: "Engineering consultancy in Uganda. Consultancy & research, construction, supervision and contract management, connected by a focus on safe, efficient and sustainable projects.",
    landing_intro_label: "A COMPLETE VIEW OF DELIVERY",
    landing_intro: "Good engineering considers the whole project; great engineering also considers what comes after delivery.",
  },
  ], { onConflict: "division" });
  await insert("homepage_content", [{
  hero_kicker: "ENGINEERING · INTELLIGENCE · LONGEVITY",
  hero_title: "Engineering the Longevity of Civilisation.",
  hero_subtitle: "ROOTED IN AFRICA. BUILT FOR GENERATIONS.",
  premise_label: "THE DRENIAK PERSPECTIVE",
  premise_heading: "We started with engineering. We are building towards economies.",
  closing_text: "The things we build should outlast us. The value they create should go further.",
  }]);
  await insert("company_values", [
  ...brief.values.map((value, sort_order) => ({ division: "asset-management", name: value.name, text: value.text, sort_order })),
  ...engineering.values.map((name, sort_order) => ({ division: "engineering", name, text: name, sort_order })),
  ]);
  await insert("services", [
  ...brief.services.map((service, sort_order) => ({
    division: "asset-management",
    name: service.name,
    description: service.description,
    includes: service.includes,
    value: service.value,
    editorial_status: "published",
    sort_order,
  })),
  ...engineering.services.map((service, sort_order) => ({
    division: "engineering",
    name: service.name,
    description: service.description,
    includes: service.includes,
    value: service.value,
    editorial_status: service.editorialStatus,
    sort_order,
  })),
  ]);
  await insert("sectors", [
  ...brief.sectors.map((sector, sort_order) => ({ division: "asset-management", ...sector, sort_order })),
  ...engineering.sectors.map((name, sort_order) => ({ division: "engineering", name, description: "", sort_order })),
  ]);
  await insert("founder", [{ name: founder.name, role: founder.role, story_href: founder.storyHref }]);
  await insert("social_links", socialLinks.map((link, sort_order) => ({ ...link, sort_order })));

  console.log(JSON.stringify({
  companyProfiles: 2,
  assetValues: brief.values.length,
  engineeringValues: engineering.values.length,
  assetServices: brief.services.length,
  engineeringServices: engineering.services.length,
  assetSectors: brief.sectors.length,
  engineeringSectors: engineering.sectors.length,
  founders: 1,
  socialLinks: socialLinks.length,
  insights: 0,
  testimonials: 0,
  }, null, 2));
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
