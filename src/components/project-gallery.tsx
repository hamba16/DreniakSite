import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
          <div className="project-gallery-image">
            <Image src="/images/projects/construction-progress.webp" alt="Site photograph of a concrete building frame, masonry and scaffolding during construction" fill sizes="(max-width: 760px) 86vw, 42vw" />
          </div>
          <figcaption><span className="eyebrow">ON SITE</span><h3>Construction in progress</h3><p>Site photograph from Dreniak’s project files.</p></figcaption>
        </figure>
        <figure>
          <div className="project-gallery-image">
            <Image src="/images/projects/ag-rosa-render.webp" alt="Supplied architectural rendering of AG Rosa, showing balconies, planted terraces and the entrance" fill sizes="(max-width: 760px) 86vw, 42vw" />
          </div>
          <figcaption><span className="eyebrow">ARCHITECTURAL VIEW</span><h3>AG Rosa</h3><p>Project rendering supplied by Dreniak.</p></figcaption>
        </figure>
      </div>
    </section>
  );
}
