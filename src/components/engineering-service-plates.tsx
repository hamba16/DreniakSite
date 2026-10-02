import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "./interactions";
import styles from "./engineering-service-plates.module.css";

// Explicit semantic assignments. Other services remain text-only.
const photography: Record<string, { src: string; alt: string; caption: string; width: number; height: number }> = {
  Construction: {
    src: "/images/projects/building-a-plastering-front.webp",
    alt: "Concrete apartment frame with open balconies, timber scaffolding and construction materials",
    caption: "Concrete frame and facade works",
    width: 1080, height: 810,
  },
  Supervision: {
    src: "/images/projects/proposed/building-b-stone-apartments-masonry-side-01.jpeg",
    alt: "Stone-clad apartment side elevation with scaffolding and unfinished openings",
    caption: "Masonry and scaffolding at the finishing stage",
    width: 908, height: 1080,
  },
};
export function EngineeringServicePlates({ services }: { services: Service[] }) {
  return <div className={styles.plates}>{services.map((service,index)=>{
    const image=photography[service.name];
    return <section key={service.name} id={`service-${index}`} className={styles.plate} data-illustrated={!!image}>
      <div className={styles.copy}>
        <span className="eyebrow">0{index+1} / ENGINEERING</span>
        <h2 id={`service-heading-${index}`}>{service.name}</h2><p>{service.description}</p>
        <ul>{service.includes.map(item=><li key={item}>{item}</li>)}</ul>
        <p className={styles.value}>{service.value}</p>
        <Link className="text-link" href={`/engineering/consultation?service=${encodeURIComponent(service.name)}`}>Discuss this service <ArrowUpRight size={17}/></Link>
      </div>
      {image && <figure><Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width:760px) 86vw, 42vw"/><figcaption>{image.caption}. Supplied site photograph; location and relationship to Dreniak remain unconfirmed.</figcaption></figure>}
    </section>;
  })}</div>;
}
