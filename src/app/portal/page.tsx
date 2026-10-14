import { redirect } from "next/navigation";
import { Header } from "@/components/interactions";
import { Footer } from "@/components/shared";
import { PortalSignIn } from "@/components/portal-sign-in";
import { getPortalSession } from "@/lib/portal/access";
import { isPortalConfigured } from "@/lib/portal/supabase";
export const metadata = {
  title: "Client Portal — Sign In",
  robots: { index: false, follow: false },
};
export default async function Portal({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const query = await searchParams;
  const session = await getPortalSession();
  if (session.state === "ready")
    redirect(session.identity.staffRole ? "/portal/dashboard" : "/portal/onboarding");
  return (
    <>
      <Header />
      <main id="main">
        <PortalSignIn configured={isPortalConfigured()} status={query.status} />
      </main>
      <Footer />
    </>
  );
}
