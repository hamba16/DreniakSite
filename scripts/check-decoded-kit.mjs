import fs from 'node:fs';
import path from 'node:path';
const dir = 'public/brand/decoded';
const palette = new Set(['#991923', '#0d3251', '#ffffff', '#000000']);
const counts = { nonBrandColours: 0, primacyViolations: 0, missingDescriptions: 0 };
let lockups = 0;
for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.svg'))) {
  const svg = fs.readFileSync(path.join(dir, name), 'utf8');
  counts.nonBrandColours += [...svg.matchAll(/#[0-9a-f]{6}\b/gi)].filter(([c]) => !palette.has(c.toLowerCase())).length;
  counts.missingDescriptions += Number(!/<title\b/.test(svg) || !/<desc\b/.test(svg) || !/role="img"/.test(svg));
  const primary = [...svg.matchAll(/<svg data-primary="true"[^>]+>/g)];
  const decoded = [...svg.matchAll(/<svg data-decoded="true"[^>]+>/g)];
  function height(tag) {
    const viewBox = tag.match(/viewBox="([^"]+)"/)[1].split(' ').map(Number);
    return viewBox[3] * Math.min(Number(tag.match(/width="([^"]+)"/)[1]) / viewBox[2], Number(tag.match(/height="([^"]+)"/)[1]) / viewBox[3]);
  }
  if (primary.length) {
    lockups++;
    counts.primacyViolations += Number(!decoded.length || Math.min(...primary.map(([s]) => height(s))) < Math.max(...decoded.map(([s]) => height(s))));
  }
}
console.log(JSON.stringify({ lockupsChecked: lockups, ...counts }, null, 2));
if (Object.values(counts).some(Boolean)) process.exitCode = 1;
