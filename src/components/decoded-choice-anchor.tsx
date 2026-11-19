"use client";

import { useEffect } from "react";

const choiceIds = new Set(["if-you-chose-a", "if-you-chose-b"]);

export function DecodedChoiceAnchor() {
  useEffect(() => {
    function openChoiceFromHash() {
      const id = window.location.hash.slice(1);
      if (!choiceIds.has(id)) return;

      const tab = document.querySelector<HTMLButtonElement>(
        `[role="tab"][aria-controls="${id}-panel"]`,
      );
      if (tab) {
        tab.click();
        window.requestAnimationFrame(() =>
          tab.scrollIntoView({ block: "start" }),
        );
        return;
      }

      const choice = document.getElementById(id);
      if (!(choice instanceof HTMLDetailsElement)) return;
      choice.open = true;
      window.requestAnimationFrame(() =>
        choice.scrollIntoView({ block: "start" }),
      );
    }

    openChoiceFromHash();
    window.addEventListener("hashchange", openChoiceFromHash);
    return () => window.removeEventListener("hashchange", openChoiceFromHash);
  }, []);

  return null;
}
