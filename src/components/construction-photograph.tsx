import Image from "next/image";
import construction from "../../public/images/projects/building-a-plastering-front.webp";

export function ConstructionPhotograph() {
  return (
    <figure className="conceptual-figure construction-photograph">
      <div className="conceptual-image">
        <Image
          src={construction}
          alt="Unfinished apartment building with open balconies, timber scaffolding and construction materials in front"
          sizes="(max-width: 760px) 80vw, 540px"
          placeholder="blur"
          style={{ objectPosition: "50% 50%" }}
        />
      </div>
      <figcaption>Site photograph</figcaption>
    </figure>
  );
}
