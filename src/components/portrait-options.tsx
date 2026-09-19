"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./portrait-options.module.css";

const options = [
  {
    id: "darren-1",
    label: "Cutout",
    note: "Clean, direct and flexible",
    src: "/images/Team/Darren 1.jpg",
    position: "50% 30%",
    className: "cutout",
  },
  {
    id: "darren-2",
    label: "Studio / full length",
    note: "Formal and established",
    src: "/images/Team/Darren 2.jpg",
    position: "50% 38%",
    className: "studio",
  },
  {
    id: "darren-3",
    label: "Studio / portrait",
    note: "Warm and approachable",
    src: "/images/Team/Darren 3.jpg",
    position: "50% 27%",
    className: "light",
  },
  {
    id: "derrick-cutout",
    label: "Derrick / cutout",
    note: "Transparent-background treatment",
    src: "/images/Team/d2rrick -cutout2.png",
    position: "50% 30%",
    className: "cutout",
  },
  {
    id: "derrick-studio",
    label: "Derrick / studio",
    note: "Matched neutral studio background",
    src: "/images/Team/Derrick studio.jpg",
    position: "50% 50%",
    className: "studio",
  },
  {
    id: "derrick-suit-cutout",
    label: "Derrick / suit cutout",
    note: "Formal cutout treatment",
    src: "/images/Team/derrick-suit-cutout.png",
    position: "50% 30%",
    className: "cutout",
  },
  {
    id: "derrick-suit-studio",
    label: "Derrick / suit studio",
    note: "Darker matched studio background",
    src: "/images/Team/Derrick suit studio.jpg",
    position: "50% 50%",
    className: "studio",
  },
] as const;

export function PortraitOptions() {
  type OptionId = (typeof options)[number]["id"];
  const [selected, setSelected] = useState<OptionId>(options[0].id);
  const active = options.find((option) => option.id === selected) ?? options[0];

  return (
    <div className={styles.wrapper}>
      <div className={styles.intro}>
        <div>
          <span className="eyebrow">PORTRAIT DIRECTION</span>
          <h3>Which image feels most like Dreniak?</h3>
        </div>
        <p>Review each treatment in the same card framing before choosing a final direction.</p>
      </div>
      <div className={styles.tabs} role="tablist" aria-label="Portrait options">
        {options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            id={`${option.id}-tab`}
            aria-selected={selected === option.id}
            aria-controls={`${option.id}-panel`}
            tabIndex={selected === option.id ? 0 : -1}
            className={selected === option.id ? styles.tabActive : styles.tab}
            onClick={() => setSelected(option.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                const next = options[(index + 1) % options.length];
                setSelected(next.id);
                document.getElementById(`${next.id}-tab`)?.focus();
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                const previous = options[(index - 1 + options.length) % options.length];
                setSelected(previous.id);
                document.getElementById(`${previous.id}-tab`)?.focus();
              }
            }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {option.label}
          </button>
        ))}
      </div>
      <div
        className={`${styles.preview} ${styles[active.className]}`}
        role="tabpanel"
        id={`${active.id}-panel`}
        aria-labelledby={`${active.id}-tab`}
      >
        <Image
          src={active.src}
          alt={`${active.label} portrait option`}
          fill
          sizes="(max-width: 700px) 100vw, 620px"
          style={{ objectFit: "contain", objectPosition: active.position }}
          priority
        />
        <div className={styles.previewMeta}>
          <span className="eyebrow">SELECTED OPTION</span>
          <strong>{active.label}</strong>
          <span>{active.note}</span>
        </div>
      </div>
    </div>
  );
}
