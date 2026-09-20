import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PNG } from "pngjs";

test("story portraits and data-driven monograms render accessibly", async ({ page }, info) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  await page.goto("/story");
  for (const id of ["darren-kamunuga", "derrick-nkurunungi"]) {
    const card=page.locator(`#${id}`);
    await card.scrollIntoViewIfNeeded();
    const portrait=card.locator("img");
    await expect(portrait).toHaveCount(1);
    await expect.poll(()=>portrait.evaluate((img:HTMLImageElement)=>img.complete && img.naturalWidth>0)).toBe(true);
    await expect(card.locator("[data-team-fallback]")).toHaveCount(0);
    await card.screenshot({path:`doc/preview/final-${id}-${info.project.name}.png`});
  }
  for (const id of ["tania-judith-bita-olielo", "jude-karamura"]) {
    const card=page.locator(`#${id}`);
    await expect(card.locator("img")).toHaveCount(0);
    await expect(card.locator("[data-team-fallback]")).toBeVisible();
    await expect(card.getByRole("img",{name:/monogram/})).toBeVisible();
    await card.screenshot({path:`doc/preview/final-${id}-${info.project.name}.png`});
  }
  await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
  await page.locator("#leadership").screenshot({path:`doc/preview/final-leadership-${info.project.name}.png`});
  expect((await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze()).violations).toEqual([]);
  // Axe skips aria-hidden monogram glyphs; explicitly verify their computed colors.
  const contrast=await page.locator("[data-team-fallback]").evaluateAll(nodes=>nodes.map(node=>{
    const luminance=(color:string)=>{ const rgb=color.match(/\d+/g)!.slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4); return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722; };
    const style=getComputedStyle(node), a=luminance(style.color), b=luminance(style.backgroundColor);
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  }));
  expect(contrast.every(value=>value>=4.5)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  for(const route of ["/engineering/about","/asset-management/about"]) {
    await page.goto(route);
    await expect(page.locator('.leadership img[alt="Darren Kamunuga"]')).toBeVisible();
    if(route.startsWith("/engineering")) await expect(page.locator("[data-team-fallback]")).toHaveCount(1);
  }
});

test("Apple touch icon metadata resolves to a nonempty 180px PNG", async ({ page, request }) => {
  await page.goto("/story");
  const href=await page.locator('link[rel="apple-touch-icon"]').first().getAttribute("href");
  expect(href).toBeTruthy();
  const response=await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  const png=PNG.sync.read(await response.body());
  expect([png.width,png.height]).toEqual([180,180]);
  expect(new Set(png.data).size).toBeGreaterThan(10);
});
