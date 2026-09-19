import { leaders } from "@/content/leadership";
import { LeadershipCard } from "./leadership-card";
import styles from "./leadership-section.module.css";
import { PortraitOptions } from "./portrait-options";

export function LeadershipSection({ context }: {
  context: "story" | "engineering" | "asset-management";
}) {
  const shared = context === "story";
  const members = shared ? leaders : leaders.filter((leader) =>
    leader.id === "darren-kamunuga" ||
    (context === "engineering" && leader.scope === "Dreniak Engineering"),
  );
  return (
    <section id="leadership" className={styles.section} aria-labelledby="leadership-heading">
      <div className={styles.heading}>
        <span className="eyebrow">{context === "engineering" ? "THE PEOPLE BEHIND THE WORK" : "LEADERSHIP"}</span>
        <h2 id="leadership-heading">{context === "engineering" ? "Leadership & team" : <>A personal ambition.<br />A shared future.</>}</h2>
      </div>
      {shared && <PortraitOptions />}
      <div className={styles.grid} data-count={members.length}>
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
      </div>
    </section>
  );
}
