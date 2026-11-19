import fs from 'node:fs/promises';
import sharp from 'sharp';
const kit = 'public/brand/decoded';
const out = 'public/newsletter/decoded-01';
const plates = 'assets/images/decoded-01';
await fs.mkdir(out, { recursive: true });
await fs.mkdir('public/images/insights', { recursive: true });
const entries = [];
async function save(pipeline, file, width, height, alt, use) {
  await pipeline.toFile(`public${file}`);
  entries.push({ file, width, height, alt, use });
}
const heroAlt = 'Illustration: distribution transformer and overhead lines beside a red earth road in a Ugandan trading centre at late afternoon.';
await save(sharp(`${plates}/hero-plate.png`).resize(1600, 900).jpeg({ quality: 88, mozjpeg: true }), '/images/insights/after-the-connection-hero.jpg', 1600, 900, heroAlt, 'Article hero');
await save(sharp(`${plates}/hero-plate.png`).resize(640, 360).jpeg({ quality: 84, mozjpeg: true }), '/images/insights/after-the-connection-thumb.jpg', 640, 360, heroAlt, 'Insights listing thumbnail');
await save(sharp(`${plates}/research-plate.png`).resize(1200, 480).jpeg({ quality: 86, mozjpeg: true }), '/images/insights/after-the-connection-research.jpg', 1200, 480, 'Illustration: abstract electricity feeders, nodes and a grid fading into indigo dusk.', 'Research brief section header');

// The exact Inter outlines and original logo come from the approved code kit.
const header = await fs.readFile(`${kit}/email-header.svg`, 'utf8');
const headerBody = header.slice(header.indexOf('</desc>') + 7, header.lastIndexOf('</svg>')).replace('<rect width="1200" height="400" fill="#0d3251"/>', '');
const illustration = await fs.readFile(`${kit}/illustration-label.svg`, 'utf8');
function overlay(width, height, top = 0) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="600" height="${height}" fill="#0d3251"/><g transform="translate(0 ${top})">${headerBody}</g><svg x="1010" y="${height - 46}" width="170" height="30" viewBox="0 0 170 30">${illustration.slice(illustration.indexOf('</desc>') + 7, illustration.lastIndexOf('</svg>'))}</svg></svg>`);
}
for (const [file, height, use] of [
  ['/images/insights/after-the-connection-og.jpg', 630, 'Open Graph and Twitter share image'],
  ['/newsletter/decoded-01/linkedin-card.jpg', 627, 'LinkedIn share card'],
  ['/newsletter/decoded-01/email-banner.jpg', 400, 'Buttondown email header'],
]) {
  await save(sharp(`${plates}/hero-plate.png`).resize(1200, height, { position: 'right' }).composite([{ input: overlay(1200, height, height === 400 ? 0 : 90) }]).jpeg({ quality: 90, mozjpeg: true }), file, 1200, height, 'Dreniak Limited — Decoded. Issue 01: After the connection. Illustration of a Ugandan electricity distribution transformer.', use);
}
const icon = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#ffffff"/>${(await fs.readFile(`${kit}/lockup-stacked.svg`, 'utf8')).replace('<svg ', '<svg x="28" y="120" ').replace('width="400" height="210"', 'width="456" height="240"')}</svg>`);
await save(sharp(icon).png(), '/newsletter/decoded-01/buttondown-icon.png', 512, 512, 'Dreniak Limited, with the smaller Decoded series descriptor beneath.', 'Buttondown publication icon');
for (const [name, height, alt, use] of [
  ['stat-card', 630, 'Distribution loss rate: 16.7% in 2024 to 18.1% in 2025, up 1.4 percentage points. Source: ERA distribution data; Dreniak calculations.', 'Email distribution loss statistic'],
  ['energy-chart', 675, 'Uganda electricity, GWh: 2024 purchased 5,815, sold 4,846; 2025 purchased 6,630, sold 5,430. Source: ERA distribution data.', 'Email purchased-versus-sold bar chart'],
]) await save(sharp(`${kit}/${name}.svg`).png(), `/newsletter/decoded-01/${name}.png`, 1200, height, alt, use);
await fs.writeFile(`${out}/assets.json`, JSON.stringify({ series: 'Dreniak Decoded', issue: '01', generatedPlates: 2, assets: entries }, null, 2) + '\n');
const counts = { dimensionMismatches: 0, missingAlt: 0 };
for (const entry of entries) {
  const meta = await sharp(`public${entry.file}`).metadata();
  counts.dimensionMismatches += Number(meta.width !== entry.width || meta.height !== entry.height);
  counts.missingAlt += Number(!entry.alt.trim());
}
console.log(JSON.stringify({ exported: entries.length, ...counts }, null, 2));
if (Object.values(counts).some(Boolean)) process.exitCode = 1;
