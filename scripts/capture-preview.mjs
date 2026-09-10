import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.TEST_BASE_URL || 'http://localhost:3000';
await mkdir('docs/preview', {recursive:true});
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
for (const [name,route] of [['home','/'],['divisions','/#divisions'],['asset-management','/asset-management'],['engineering','/engineering'],['services','/asset-management/services'],['about','/asset-management/about'],['assessment','/asset-management/assessment']]) {
  await page.goto(origin+route);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`docs/preview/desktop-${name}.png`});
}
await page.setViewportSize({width:390,height:844});
for (const [name,route] of [['home','/'],['asset-management','/asset-management'],['contact','/asset-management/contact'],['assessment','/asset-management/assessment']]) {
  await page.goto(origin+route);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`docs/preview/mobile-${name}.png`});
}
for (const brand of ['parent','engineering','asset-management']) {
  const response = await page.request.get(`${origin}/og/${brand}`);
  if (!response.ok()) throw new Error(`Social card failed: ${brand}`);
  await writeFile(`docs/preview/social-${brand}.png`,await response.body());
}
await browser.close();
console.log('Saved desktop, mobile and social-card review images under docs/preview.');
