import fs from 'node:fs';
import path from 'node:path';
const dir = 'public/brand/decoded';
const palette = new Set(['#991923', '#0d3251', '#ffffff', '#000000']);
const counts = { nonBrandColours: 0, primacyViolations: 0, missingDescriptions: 0, contrastFailures: 0, incorrectBars: 0 };
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
function luminance(hex) {
  const channels = hex.match(/[a-f0-9]{2}/gi).map(channel => parseInt(channel, 16) / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return channels.reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
}
const contrastRatios = Object.fromEntries(['#0d3251', '#991923', '#000000'].map(color => [color, (luminance('#ffffff') + 0.05) / (luminance(color) + 0.05)]));
counts.contrastFailures = Object.values(contrastRatios).filter(ratio => ratio < 4.5).length;
const chart = fs.readFileSync(path.join(dir, 'energy-chart.svg'), 'utf8');
const bars = [...chart.matchAll(/<rect x="340" y="\d+" width="([\d.]+)"/g)].map(match => Number(match[1]));
counts.incorrectBars = [5815, 4846, 6630, 5430].filter((value, i) => !Number.isFinite(bars[i]) || Math.abs(bars[i] - value / 7000 * 650) > 0.001).length;
console.log(JSON.stringify({ lockupsChecked: lockups, contrastRatios, ...counts }, null, 2));
if (Object.values(counts).some(Boolean)) process.exitCode = 1;
