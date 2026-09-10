import { notFound } from "next/navigation";
import { Header } from "@/components/interactions";
import { Footer } from "@/components/shared";
import { divisions, type Division } from "@/lib/site";
export default async function DivisionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  if (!divisions.includes(division as Division)) notFound();
  return (
    <div className={`division-site ${division}`}>
      <Header division={division as Division} />
      {children}
      <Footer />
    </div>
  );
}
