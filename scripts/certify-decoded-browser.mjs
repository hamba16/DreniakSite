import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const origin = process.env.TEST_BASE_URL || 'http://localhost:3000';
const article = '/asset-management/insights/after-the-connection-africa-electricity';
const listing = '/asset-management/insights';
const capture = process.argv.includes('--capture');
const probe = process.argv.includes('--probe');
let browser;
const rows = process.argv.includes('--resume') ? JSON.parse(await fs.readFile('doc/decoded-01/evidence/browser.json', 'utf8')).filter(row => row.origin === origin) : [];
await fs.mkdir('doc/decoded-01/evidence', { recursive: true });
await fs.writeFile('doc/decoded-01/evidence/browser.json', JSON.stringify(rows, null, 2) + '\n');
try {
  for (const route of (probe ? [article] : [article, listing])) {
    for (const width of (probe ? [360] : [360, 768, 1280])) {
      for (const colorScheme of (probe ? ['light'] : ['light', 'dark'])) {
        if (rows.some(row => row.route === route && row.width === width && row.colorScheme === colorScheme)) continue;
        browser = await chromium.launch();
        const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme, reducedMotion: 'reduce' });
        const page = await context.newPage();
        page.setDefaultTimeout(45000);
        let releaseImages;
        const imageGate = new Promise(resolve => { releaseImages = resolve; });
        await page.route('**/*', async route => {
          const request = route.request();
          if (request.resourceType() === 'image' && /decoded|after-the-connection/.test(decodeURIComponent(request.url()))) await imageGate;
          await route.continue();
        });
        const external = new Set();
        page.on('request', request => { if (new URL(request.url()).origin !== origin) external.add(new URL(request.url()).origin); });
        await page.addInitScript(() => {
          window.decodedImageShift = 0;
          window.decodedShiftSources = [];
          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) if (!entry.hadRecentInput) {
              window.decodedImageShift += entry.value;
              window.decodedShiftSources.push(...(entry.sources || []).map(s => ({ tag: s.node?.tagName, className: String(s.node?.className || '').slice(0, 100), previous: s.previousRect, current: s.currentRect })));
            }
          }).observe({ type: 'layout-shift', buffered: true });
        });
        const response = await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.getByRole('heading', { level: 1 }).filter({ hasText: route === article ? 'After the connection' : 'Perspectives on infrastructure' }).waitFor();
        await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Font loading timed out')), 30000))]));
        const reserved = await page.locator('main img').evaluateAll(images => images.filter(image => /decoded|after-the-connection/.test(decodeURIComponent(image.getAttribute('src')))).map(image => {
          const rect = image.getBoundingClientRect();
          return { src: image.getAttribute('src'), width: rect.width, height: rect.height };
        }));
        releaseImages();
        // Trigger all lazy images, then return to the top for the permitted captures.
        for (const image of await page.locator('main img').all()) await image.scrollIntoViewIfNeeded();
        await page.evaluate(async () => {
          await Promise.race([
            Promise.all([...document.querySelectorAll('main img')].map(image => image.decode().catch(() => {}))),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Image loading timed out')), 30000)),
          ]);
          scrollTo(0, 0);
        });
        const loaded = await page.locator('main img').evaluateAll(images => images.filter(image => /decoded|after-the-connection/.test(decodeURIComponent(image.getAttribute('src')))).map(image => {
          const rect = image.getBoundingClientRect();
          return { src: image.getAttribute('src'), width: rect.width, height: rect.height };
        }));
        const imageLayoutShiftFailures = reserved.filter(before => {
          const after = loaded.find(image => image.src === before.src);
          return !after || Math.abs(after.width - before.width) > 0.5 || Math.abs(after.height - before.height) > 0.5;
        }).length;
        const counts = await page.evaluate(() => {
          const main = document.querySelector('main');
          const textOverflows = [...main.querySelectorAll('h1,h2,h3,p,span,strong,a,summary,figcaption')].filter(element => {
            if (element.closest('[class*="tableScroller"],[class*="chartScroller"]')) return false;
            if (!element.getClientRects().length || getComputedStyle(element).clip !== 'auto' || getComputedStyle(element).clipPath !== 'none') return false;
            return element.scrollWidth > element.clientWidth + 2 && getComputedStyle(element).display !== 'inline';
          }).map(element => ({ tag: element.tagName, text: element.textContent.slice(0, 70) }));
          const images = [...main.querySelectorAll('img')];
          const globalMarks = [...document.querySelectorAll('body > header img,header:not(main header) img,footer img')].filter(image => image.getAttribute('src')?.includes('/decoded/'));
          return {
            missingSeriesIdentity: Number(!main.querySelector('img[src="/brand/decoded/wordmark.svg"]')),
            missingArticleGraphics: location.pathname.endsWith('after-the-connection-africa-electricity') ? Math.abs(main.querySelectorAll('[data-decoded-graphic]').length - 4) : 0,
            globalDecodedMarks: globalMarks.length,
            imagesMissingAlt: images.filter(image => !image.hasAttribute('alt')).length,
            brokenImages: images.filter(image => !image.complete || image.naturalWidth === 0).length,
            missingImageDimensions: images.filter(image => /decoded|after-the-connection/.test(image.getAttribute('src')) && (!image.getAttribute('width') || !image.getAttribute('height'))).length,
            pageOverflow: Number(document.documentElement.scrollWidth > innerWidth + 1),
            textOverflows,
            observedPageLayoutShift: window.decodedImageShift,
            shiftSources: window.decodedShiftSources,
          };
        });
        const axe = await new AxeBuilder({ page }).include('main').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
        rows.push({ origin, route, width, colorScheme, status: response.status(), ...counts, imagesMeasured: reserved.length, imageLayoutShiftFailures, externalOrigins: [...external], axeViolations: axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) });
        await fs.writeFile('doc/decoded-01/evidence/browser.json', JSON.stringify(rows, null, 2) + '\n');
        if (capture && colorScheme === 'light' && width !== 768) {
          // Exactly four screenshots: article top and listing at the two requested sizes.
          const file = `doc/decoded-01/evidence/${route === article ? 'article' : 'listing'}-${width}.png`;
          if (!(await fs.access(file).then(() => true, () => false))) await page.screenshot({ path: file, fullPage: false });
        }
        await context.close();
        await browser.close();
      }
    }
  }
} finally {
  await browser?.close();
}
await fs.writeFile('doc/decoded-01/evidence/browser.json', JSON.stringify(rows, null, 2) + '\n');
const failures = rows.filter(r => r.status !== 200 || r.missingSeriesIdentity || r.missingArticleGraphics || r.globalDecodedMarks || r.imagesMissingAlt || r.brokenImages || r.missingImageDimensions || r.pageOverflow || r.textOverflows.length || r.imageLayoutShiftFailures || r.externalOrigins.length || r.axeViolations.length);
console.log(JSON.stringify({ contexts: rows.length, failedContexts: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
