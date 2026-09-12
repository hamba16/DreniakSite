import { test, expect } from "@playwright/test";

test("founder card opens with the keyboard and links to the story", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#premise");
  const card = page.locator(".founder-card");
  const tab = card.locator("summary");
  await expect(card.locator("h3")).toHaveText("Darren Kamunuga");
  await tab.focus();
  await tab.press("Enter");
  await expect(card).not.toHaveAttribute("open", "");
  await tab.press("Enter");
  await expect(card).toHaveAttribute("open", "");
  await card.screenshot({ path: `tmp/prose-audit/founder-${test.info().project.name}.png` });
  await card.getByRole("link", { name: "Our story" }).click();
  await expect(page).toHaveURL(/\/story$/);
});

test("original division heroes and supplied project images load without overflow", async ({ page }) => {
  for (const route of ["/engineering", "/asset-management", "/engineering/projects"]) {
    await page.goto(route);
    const images = page.locator(".division-hero > img, .project-gallery-image img");
    await expect(images).toHaveCount(route.endsWith("projects") ? 2 : 1);
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
      expect(await img.evaluate(node => getComputedStyle(node).filter)).toBe("none");
    }
    await expect(page.locator(".division-hero-overlay")).toHaveCount(route.endsWith("projects") ? 0 : 1);
    if (!route.endsWith("projects")) {
      await expect(images).toHaveAttribute("src", new RegExp(encodeURIComponent(`/images${route}.webp`)));
      await expect(page.locator(".division-hero .button")).toHaveAttribute("href", route === "/engineering" ? "/engineering/consultation" : "/asset-management/contact");
      if (route === "/engineering") await expect(page.locator(".engineering-hero-whatsapp")).toHaveAttribute("href", "https://wa.me/256704175005");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const target = page.locator(route.endsWith("projects") ? ".project-gallery" : ".division-hero");
    await target.screenshot({ path: `tmp/prose-audit/${route.replaceAll("/", "-")}-${test.info().project.name}.png` });
  }
});
