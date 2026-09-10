import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Experience } from "@/components/interactions";
import { AnalyticsConsent } from "@/components/forms";
import { siteUrl } from "@/lib/site";
import "./globals.css";
const inter = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Dreniak — Live the Future", template: "%s | Dreniak" },
  description:
    "One origin. Two disciplines. Dreniak brings engineering and asset management together to engineer the longevity of civilisation.",
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/mark-red.svg", type: "image/svg+xml" },
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
    <html lang="en" className={inter.variable}>
      <body id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Experience>{children}</Experience>
        <AnalyticsConsent />
      </body>
    </html>
  );
}
