import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import constructionProgress from "../../public/images/projects/construction-progress.webp";
import agRosaRender from "../../public/images/projects/ag-rosa-render.webp";
import bungaSite from "../../public/images/projects/bunga-site.webp";
import muyengaSite from "../../public/images/projects/muyenga-site.webp";
import naalyaSite from "../../public/images/projects/naalya-site.webp";

export function ProjectGallery() {
  return (
    <section className="project-gallery" aria-labelledby="project-gallery-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FROM OUR PROJECT FILES</span>
          <h2 id="project-gallery-title">A view of the work.</h2>
        </div>
        <Link href="/engineering/consultation" className="text-link">
          Discuss a project <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="project-gallery-grid">
        <figure>
          <div className="project-gallery-image project-gallery-image--site">
            <Image src={constructionProgress} alt="Site photograph of a concrete building frame, masonry and scaffolding during construction" fill sizes="(max-width: 760px) 86vw, 42vw" placeholder="blur" />
          </div>
          <figcaption><span className="eyebrow">ON SITE</span><h3>Construction in progress</h3><p>Site photograph from Dreniak’s project files.</p></figcaption>
        </figure>
        <figure>
          <div className="project-gallery-image">
            <Image src={agRosaRender} alt="Supplied architectural rendering of AG Rosa, showing balconies, planted terraces and the entrance" fill sizes="(max-width: 760px) 86vw, 42vw" placeholder="blur" />
          </div>
          <figcaption><span className="eyebrow">ARCHITECTURAL VIEW</span><h3>AG Rosa</h3><p>Project rendering supplied by Dreniak.</p></figcaption>
        </figure>
        <figure>
          <div className="project-gallery-image project-gallery-image--landscape">
            <Image src={bungaSite} alt="Concrete apartment building with open balconies and timber scaffolding" fill sizes="(max-width: 760px) 86vw, 42vw" placeholder="blur" />
          </div>
          <figcaption><span className="eyebrow">BUNGA SITE</span><h3>Construction progress</h3><p>Site photograph; location and provenance to be confirmed.</p></figcaption>
        </figure>
        <figure>
          <div className="project-gallery-image">
            <Image src={muyengaSite} alt="Ornate painted apartment facade with balconies and columns" fill sizes="(max-width: 760px) 86vw, 42vw" placeholder="blur" />
          </div>
          <figcaption><span className="eyebrow">MUYENGA SITE</span><h3>Facade works</h3><p>Site photograph; location and provenance to be confirmed.</p></figcaption>
        </figure>
        <figure>
          <div className="project-gallery-image">
            <Image src={naalyaSite} alt="White townhouse block with red tiled roofs and construction scaffolding" fill sizes="(max-width: 760px) 86vw, 42vw" placeholder="blur" />
          </div>
          <figcaption><span className="eyebrow">NAALYA SITE</span><h3>Residential construction</h3><p>Site photograph; location and provenance to be confirmed.</p></figcaption>
        </figure>
      </div>
    </section>
  );
}
