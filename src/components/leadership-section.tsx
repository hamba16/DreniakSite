import { ImageCollection } from "./image-collection";
import { leaders } from "@/content/leadership";
import { LeadershipCard } from "./leadership-card";
import styles from "./leadership-section.module.css";

export function LeadershipSection({ context }: {
  context: "story" | "engineering" | "asset-management";
}) {
  const shared = context === "story";
  const headingId = context === "engineering"
    ? "engineering-leadership"
    : "leadership-heading";
  const members = shared ? leaders : leaders.filter((leader) =>
    leader.id === "darren-kamunuga" ||
    (context === "engineering" && leader.scope === "Dreniak Engineering"),
  );
  return (
    <section id="leadership" className={`${styles.section} leadership`} aria-labelledby={headingId}>
      <div className={styles.heading}>
        <span className="eyebrow">{context === "engineering" ? "THE PEOPLE BEHIND THE WORK" : "LEADERSHIP"}</span>
        <h2 id={headingId}>{context === "engineering" ? "Leadership & team" : <>A personal ambition.<br />A shared future.</>}</h2>
      </div>
      <ImageCollection label="Meet the team" kind="people" className={styles.grid} items={members.map(leader => ({
        label: leader.name,
        image: leader.portrait?.src,
        imageAlt: leader.name,
        summary: `${leader.title} · ${leader.scope}`,
        href: leader.email ? `mailto:${leader.email}` : undefined,
        hrefLabel: leader.email ? `Email ${leader.name}` : undefined,
      }))}>
        {members.map((leader) => (
          <LeadershipCard
            key={leader.id}
            id={shared ? leader.id : undefined}
            leader={leader}
            showPhone={shared}
            backdrop="vignette"
            context={context === "engineering" ? "engineering" : "company"}
            compact={!shared && leader.id === "darren-kamunuga"}
          />
        ))}
      </ImageCollection>
    </section>
  );
}
