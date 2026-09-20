import Image from "next/image";
import Link from "next/link";
import type { Leader } from "@/content/leadership";
import styles from "./leadership-card.module.css";
import { TeamPortraitFallback } from "./team-portrait-fallback";

export function LeadershipCard({
  leader,
  backdrop,
  compact = false,
  showPhone = true,
  context,
  id,
}: {
  leader: Leader;
  backdrop: "flat" | "vignette";
  compact?: boolean;
  showPhone?: boolean;
  context?: "engineering" | "company";
  id?: string;
}) {
  return (
    <article id={id} className={styles.card} data-context={context ?? (leader.scope === "Dreniak Engineering" ? "engineering" : "company")}>
      <div className={styles.portrait} data-backdrop={backdrop}>
        <span className={styles.pattern} aria-hidden="true" />
        {leader.portrait ? (
          <Image
            src={leader.portrait.src}
            alt={leader.name}
            fill
            sizes="(max-width: 700px) 90vw, (max-width: 1000px) 45vw, 33vw"
            style={{ objectFit: "cover", objectPosition: leader.portrait.position ?? "center bottom" }}
          />
        ) : (
          <TeamPortraitFallback name={leader.name} initials={leader.initials} />
        )}
      </div>
      <div className={styles.caption}>
        <p className={styles.scope}>{leader.scope}</p>
        <h3>{leader.name}</h3>
        <p className={styles.title}>{leader.title}</p>
        {compact ? (
          <Link className={styles.contact} href={`/story#${leader.id}`}>Meet {leader.name.split(" ")[0]} <span aria-hidden="true">↗</span></Link>
        ) : (
          <div className={styles.contacts}>
            {showPhone && leader.phone && <a className={styles.contact} href={leader.phone.href}>{leader.phone.label}</a>}
            {leader.email && <a className={styles.contact} href={`mailto:${leader.email}`}>{leader.email}</a>}
          </div>
        )}
      </div>
    </article>
  );
}
