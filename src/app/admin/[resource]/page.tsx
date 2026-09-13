import Link from "next/link";
import { notFound } from "next/navigation";
import { contentForms } from "@/lib/admin-content-forms";
import { ContentEditor } from "./content-editor";
import { StructuredEditor } from "./structured-editor";

export default async function ResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (resource === "homepage_content" || resource === "company_profile") {
    return <main id="main"><span className="eyebrow">CONTENT</span><h1>{resource === "homepage_content" ? "Homepage Content" : "Company & Founder"}</h1>{resource === "company_profile" && <p className="admin-lead">Manage your company story below, or <Link href="/admin/founder" className="content-inline-link">edit the founder profile</Link>.</p>}<StructuredEditor resource={resource} /></main>;
  }
  if (!Object.hasOwn(contentForms, resource)) notFound();
  const definition = contentForms[resource];
  return <main id="main"><span className="eyebrow">CONTENT</span><h1>{definition.title}</h1><p className="admin-lead">{definition.description}</p><ContentEditor key={resource} resource={resource} /></main>;
}
