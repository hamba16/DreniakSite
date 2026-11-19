"use client";

import { useEffect } from "react";

const svgNamespace = "http://www.w3.org/2000/svg";
const energyRows = new Set(["purchased", "sold", "gap"]);

export function DecodedEnergyInteraction({
  purchasedValues,
  soldValues,
}: {
  purchasedValues: readonly number[];
  soldValues: readonly number[];
}) {
  useEffect(() => {
    const tableRows = [
      ...document.querySelectorAll<HTMLTableRowElement>(
        "tr[data-energy-row]",
      ),
    ];
    const svg = document.querySelector<SVGSVGElement>(
      '[data-decoded-graphic="energy-chart"] svg',
    );

    if (
      tableRows.length !== 3 ||
      !svg ||
      purchasedValues.length !== 2 ||
      soldValues.length !== 2
    ) {
      throw new Error("The energy chart interaction could not find its data.");
    }

    const chart = svg;
    const rectangles = [
      ...chart.querySelectorAll<SVGRectElement>("rect[fill]"),
    ].filter((rectangle) => {
      const fill = rectangle.getAttribute("fill");
      return fill === "#0d3251" || fill === "#991923";
    });
    const purchasedBars = rectangles
      .filter((rectangle) => rectangle.getAttribute("fill") === "#0d3251")
      .sort((a, b) => Number(a.getAttribute("y")) - Number(b.getAttribute("y")));
    const soldBars = rectangles
      .filter((rectangle) => rectangle.getAttribute("fill") === "#991923")
      .sort((a, b) => Number(a.getAttribute("y")) - Number(b.getAttribute("y")));

    if (purchasedBars.length !== 2 || soldBars.length !== 2) {
      throw new Error("The energy chart bar structure has changed.");
    }

    const barLabelGroups = rectangles
      .map((rectangle) => rectangle.nextElementSibling)
      .filter((element): element is SVGGElement => element instanceof SVGGElement);
    purchasedBars.forEach((bar, index) => {
      bar.dataset.energySeries = "purchased";
      bar.dataset.energyYear = String(2024 + index);
    });
    soldBars.forEach((bar, index) => {
      bar.dataset.energySeries = "sold";
      bar.dataset.energyYear = String(2024 + index);
    });
    barLabelGroups.forEach((label, index) => {
      label.dataset.energySeries = index % 2 === 0 ? "purchased" : "sold";
    });

    const definitions = document.createElementNS(svgNamespace, "defs");
    const pattern = document.createElementNS(svgNamespace, "pattern");
    pattern.setAttribute("id", "decoded-energy-gap-hatch");
    pattern.setAttribute("width", "8");
    pattern.setAttribute("height", "8");
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("patternTransform", "rotate(45)");
    const hatchBackground = document.createElementNS(svgNamespace, "rect");
    hatchBackground.setAttribute("width", "8");
    hatchBackground.setAttribute("height", "8");
    hatchBackground.setAttribute("fill", "#991923");
    hatchBackground.setAttribute("opacity", "0.08");
    const hatchLine = document.createElementNS(svgNamespace, "path");
    hatchLine.setAttribute("d", "M0 0V8");
    hatchLine.setAttribute("stroke", "#991923");
    hatchLine.setAttribute("stroke-width", "2");
    hatchLine.setAttribute("opacity", "0.45");
    pattern.append(hatchBackground, hatchLine);
    definitions.append(pattern);
    chart.insertBefore(definitions, chart.querySelector("rect"));

    function selectRow(row: HTMLTableRowElement) {
      const selected = row.dataset.energyRow;
      if (!selected || !energyRows.has(selected)) return;
      chart.dataset.energySelection = selected;
      tableRows.forEach((item) => {
        item.setAttribute(
          "aria-selected",
          String(item === row),
        );
      });
      chart
        .querySelectorAll("[data-energy-gap]")
        .forEach((gap) => gap.remove());

      if (selected !== "gap") return;
      soldBars.forEach((soldBar, index) => {
        const purchasedBar = purchasedBars[index];
        const scale = Number(purchasedBar.getAttribute("width")) /
          purchasedValues[index];
        const segment = document.createElementNS(svgNamespace, "rect");
        segment.dataset.energyGap = String(2024 + index);
        segment.setAttribute(
          "x",
          String(
            Number(soldBar.getAttribute("x")) +
              soldValues[index] * scale,
          ),
        );
        segment.setAttribute("y", soldBar.getAttribute("y") ?? "0");
        segment.setAttribute(
          "width",
          String((purchasedValues[index] - soldValues[index]) * scale),
        );
        segment.setAttribute("height", soldBar.getAttribute("height") ?? "0");
        segment.setAttribute("fill", "url(#decoded-energy-gap-hatch)");
        segment.setAttribute("aria-hidden", "true");
        soldBar.after(segment);
      });
    }

    function onRowClick(event: MouseEvent) {
      const row = event.currentTarget;
      if (row instanceof HTMLTableRowElement) selectRow(row);
    }

    function onRowKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      const row = event.currentTarget;
      if (row instanceof HTMLTableRowElement) selectRow(row);
    }

    tableRows.forEach((row) => {
      row.tabIndex = 0;
      row.addEventListener("click", onRowClick);
      row.addEventListener("keydown", onRowKeyDown);
    });

    return () => {
      tableRows.forEach((row) => {
        row.tabIndex = -1;
        row.removeEventListener("click", onRowClick);
        row.removeEventListener("keydown", onRowKeyDown);
        row.setAttribute("aria-selected", "false");
      });
      chart.querySelectorAll("[data-energy-gap]").forEach((gap) => gap.remove());
      chart
        .querySelectorAll("[data-energy-series], [data-energy-year]")
        .forEach((element) => {
          element.removeAttribute("data-energy-series");
          element.removeAttribute("data-energy-year");
        });
      delete chart.dataset.energySelection;
      definitions.remove();
    };
  }, [purchasedValues, soldValues]);

  return null;
}
