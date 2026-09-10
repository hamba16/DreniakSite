import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DivisionHome } from "@/components/division-pages";
import { divisions, names, type Division } from "@/lib/site";
export function generateStaticParams() {
  return divisions.map((division) => ({ division }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ division: string }>;
}): Promise<Metadata> {
  const { division } = await params;
  if (!divisions.includes(division as Division)) return {};
  const title = `Dreniak ${names[division as Division]} — ${division === "engineering" ? "Build. Connect. Deliver." : "Infrastructure & Economic Value"}`;
  return {
    title,
    description:
      division === "engineering"
        ? "ERB-registered Dreniak Engineering. Full project-lifecycle delivery in Uganda: assessment, design integration, construction management and post-construction support."
        : "Infrastructure asset management and investment planning across East Africa and the UK. Understand, manage, invest, digitise, protect and grow.",
    alternates: { canonical: `/${division}` },
    openGraph: { title, images: [`/og/${division}`] },
    twitter: { card: "summary_large_image", images: [`/og/${division}`] },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  if (!divisions.includes(division as Division)) notFound();
  return (
    <main id="main">
      <DivisionHome division={division as Division} />
    </main>
  );
}
