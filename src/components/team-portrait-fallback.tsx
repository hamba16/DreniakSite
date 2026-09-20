import { Mark } from "./brand";
import styles from "./team-portrait-fallback.module.css";

export function TeamPortraitFallback({ name, initials }: { name: string; initials?: string }) {
  const monogram = initials || name.trim().split(/\s+/).filter(Boolean).map(word => word[0]).filter((_, index, words) => index === 0 || index === words.length - 1).join("");
  return (
    <div className={styles.fallback} data-team-fallback role="img" aria-label={`${name} — monogram`}>
      <span className={styles.motif} aria-hidden="true"><Mark stroke /></span>
      <span className={styles.initials} aria-hidden="true">{monogram}</span>
      <span className={styles.rule} aria-hidden="true" />
    </div>
  );
}
