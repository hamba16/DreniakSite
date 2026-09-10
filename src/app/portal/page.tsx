import { Header } from "@/components/interactions";
import { Footer } from "@/components/shared";
import { PortalPage } from "@/components/division-pages";
export const metadata = {
  title: "Client Portal — Sign In",
  robots: { index: false, follow: true },
};
export default function Portal() {
  return (
    <>
      <Header />
      <main id="main">
        <PortalPage />
      </main>
      <Footer />
    </>
  );
}
