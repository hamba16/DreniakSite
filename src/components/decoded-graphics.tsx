import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

const names = ["energy-chart", "process", "decision", "stat-card"] as const;
type GraphicName = (typeof names)[number];
const graphics = Object.fromEntries(
  names.map((name) => [
    name,
    readFileSync(path.join(process.cwd(), "public", "brand", "decoded", `${name}.svg`), "utf8"),
  ]),
) as Record<GraphicName, string>;

export function DecodedGraphic({ name, className }: { name: GraphicName; className?: string }) {
  // Only checked-in SVG originals from the fixed allowlist above enter this markup.
  const markup = name === "stat-card"
    ? graphics[name].replace('viewBox="0 0 1200 630"', 'viewBox="40 210 1120 200"').replace('height="630"', 'height="214"')
    : graphics[name];
  return <div className={className} data-decoded-graphic={name} dangerouslySetInnerHTML={{ __html: markup }} />;
}
