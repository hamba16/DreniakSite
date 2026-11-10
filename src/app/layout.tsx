import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Experience } from "@/components/interactions";
import { AnalyticsConsent } from "@/components/forms";
import { SiteStructuredData } from "@/components/seo";
import { siteUrl } from "@/lib/site";
import "./globals.css";
import "./editorial.css";
import "./final-labels.css";
import "./final-imagery.css";
import "./final-motion.css";
import "./brand-flow.css";
const inter = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Dreniak — Live the Future", template: "%s | Dreniak" },
  description:
    "Dreniak brings engineering and asset management together to engineer the longevity of civilisation.",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Dreniak",
    title: "Dreniak — Live the Future",
    description: "Engineering the Longevity of Civilisation.",
    images: ["/og/parent"],
  },
  twitter: { card: "summary_large_image", images: ["/og/parent"] },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
};
export const viewport: Viewport = { themeColor: "#080808" };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body id="top">
        <SiteStructuredData />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Experience>{children}</Experience>
        <AnalyticsConsent
          vercelAnalyticsEnabled={
            process.env.VERCEL_ENV === "production" ||
            process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true"
          }
        />
      </body>
    </html>
  );
}
