import { Header } from "@/components/interactions";
import { Footer } from "@/components/shared";
import { engineeringSectorImages, assetSectorImages } from "@/content/visual-assets";

export const metadata = { title: "Image credits", alternates: { canonical: "/credits" } };

export default function Credits() {
  const credits = [...new Map([...engineeringSectorImages, ...assetSectorImages]
    .flatMap(asset => asset.imageCredit ? [[asset.imageCredit.sourceUrl, asset.imageCredit] as const] : [])).values()];
  return <><Header /><main id="main" className="privacy page-container">
    <span className="eyebrow">IMAGERY & PROVENANCE</span><h1>Image credits.</h1>
    <h2>Conceptual homepage imagery</h2>
    <p>The Crossing and The Corridor are AI-generated conceptual images, created on 3 October 2026. They illustrate engineering and infrastructure asset management. They are not photographs of real sites or evidence of Dreniak projects.</p>
    <p>The same concepts appear in the homepage division panels and the division homepage heroes. Natural colours describe their visual treatment, not their provenance.</p>
    <h2>Supplied imagery</h2>
    <p>Supplied site photographs and architectural renderings retain their individual captions. Where the location or relationship to Dreniak remains unconfirmed, the caption states this.</p>
    <h2>Licensed photography</h2>
    <p>These photographs illustrate infrastructure categories. They do not establish a project or client relationship with Dreniak.</p>
    {credits.map(credit => <section key={credit.sourceUrl}><h3>{credit.creator}</h3><p><a href={credit.sourceUrl}>Original photograph</a>{" · "}<a href={credit.licenseUrl}>{credit.license}</a>. {credit.changes}</p></section>)}
  </main><Footer /></>;
}
