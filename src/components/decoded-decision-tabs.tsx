"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import styles from "./decoded-article.module.css";

type DecisionChoice = {
  id: string;
  title: string;
  description: string;
  explanation: string;
};

export function DecodedDecisionTabs({
  choices,
  label,
}: {
  choices: readonly DecisionChoice[];
  label: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  function onTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % choices.length;
    if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + choices.length) % choices.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = choices.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextChoice = choices[nextIndex];
    setSelected(nextChoice.id);
    document.getElementById(`${nextChoice.id}-tab`)?.focus();
  }

  return (
    <>
      <div className={styles.decisionInteractive}>
        <div
          aria-label={label}
          aria-orientation="horizontal"
          className={styles.decisionTablist}
          role="tablist"
        >
          {choices.map((choice, index) => (
            <button
              aria-controls={`${choice.id}-panel`}
              aria-selected={selected === choice.id}
              className={styles.decisionTab}
              id={`${choice.id}-tab`}
              key={choice.id}
              onClick={() => setSelected(choice.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              role="tab"
              tabIndex={
                selected === choice.id || (selected === null && index === 0)
                  ? 0
                  : -1
              }
              type="button"
            >
              <strong>{choice.title}</strong>
              <span>{choice.description}</span>
            </button>
          ))}
        </div>
        {choices.map((choice) => (
          <div
            aria-labelledby={`${choice.id}-tab`}
            className={styles.decisionPanel}
            hidden={selected !== choice.id}
            id={`${choice.id}-panel`}
            key={choice.id}
            role="tabpanel"
            tabIndex={0}
          >
            <p>{choice.explanation}</p>
          </div>
        ))}
      </div>
      <div className={styles.decisionStatic}>
        <div className={styles.choices}>
          {choices.map((choice) => (
            <details
              id={choice.id}
              className={styles.choice}
              key={choice.id}
              open
            >
              <summary>
                <strong>{choice.title}</strong>
                <span>{choice.description}</span>
              </summary>
              <p>{choice.explanation}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
