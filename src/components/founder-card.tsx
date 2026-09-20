import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { founder } from "@/content/founder";
import { TeamPortraitFallback } from "./team-portrait-fallback";

export function FounderCard() {
  return (
    <details className="founder-card" open>
      <summary>
        <span className="eyebrow">THE FOUNDER</span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div className="founder-card-body">
        <div className="founder-portrait">
          {founder.portrait ? (
            <Image src={founder.portrait} alt={founder.name} fill sizes="(max-width: 760px) 80vw, 28vw" />
          ) : (
            <TeamPortraitFallback name={founder.name} />
          )}
        </div>
        <div className="founder-card-caption">
          <p>{founder.role}</p>
          <h3>{founder.name}</h3>
          <Link href={founder.storyHref} className="founder-story-link">
            Our story <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </details>
  );
}
