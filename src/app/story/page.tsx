import type { Metadata } from "next";
import { Header } from "@/components/interactions";
import { Footer, CTA } from "@/components/shared";
import { AboutContent } from "@/components/division-pages";
export const metadata: Metadata = {
  title: "Our story",
  alternates: { canonical: "/story" },
};
export default function Story() {
  return (
    <>
      <Header />
      <main id="main" className="parent-story">
        <div className="page-container">
          <AboutContent parent />
        </div>
        <CTA />
      </main>
      <Footer />
    </>
  );
}
