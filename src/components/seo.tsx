import { siteUrl, names, socialLinks, type Division } from "@/lib/site";

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

function JsonLd({ value }: { value: JsonLdValue }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(value).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function SiteStructuredData() {
  return (
    <JsonLd
      value={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${siteUrl}/#organization`,
            name: "Dreniak Limited",
            url: siteUrl,
            logo: `${siteUrl}/favicon.png`,
            description:
              "Dreniak brings engineering and asset management together to engineer the longevity of civilisation.",
            email: "mailto:info@dreniak.com",
            telephone: "+44 7789 063938",
            sameAs: socialLinks.map((link) => link.href),
            knowsAbout: [
              "Infrastructure engineering",
              "Infrastructure asset management",
              "Lifecycle planning",
              "Capital planning",
              "Infrastructure resilience",
            ],
          },
          {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            name: "Dreniak",
            url: siteUrl,
            publisher: { "@id": `${siteUrl}/#organization` },
          },
        ],
      }}
    />
  );
}

export function BreadcrumbStructuredData({
  division,
  label,
  path,
}: {
  division: Division;
  label?: string;
  path?: string;
}) {
  const items = [
    { name: "Dreniak", url: siteUrl },
    { name: names[division], url: `${siteUrl}/${division}` },
    ...(label
      ? [{ name: label, url: `${siteUrl}/${division}/${path || label.toLowerCase().replace(/\s+/g, "-")}` }]
      : []),
  ];

  return (
    <JsonLd
      value={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function ArticleStructuredData({
  type = "Article",
  headline,
  description,
  url,
  datePublished,
  author,
}: {
  type?: "Article" | "CreativeWork";
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  author?: string;
}) {
  return (
    <JsonLd
      value={{
        "@context": "https://schema.org",
        "@type": type,
        headline,
        description,
        url,
        ...(datePublished ? { datePublished } : {}),
        author: author
          ? { "@type": "Person", name: author }
          : { "@type": "Organization", name: "Dreniak Limited" },
        publisher: { "@id": `${siteUrl}/#organization` },
      }}
    />
  );
}
