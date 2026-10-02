import { test, expect } from "@playwright/test";

const stages = ["Understand", "Manage", "Invest", "Digitise", "Protect", "Grow"];
const nigeria = "/asset-management/projects/from-construction-project-to-performing-asset";

test("reduced motion has static imagery and a compact manual journey", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/asset-management");
  await expect(page.locator(".journey")).toHaveAttribute("data-mode", "flat");
  const image = page.locator(".cinematic-image__drift");
  expect(await image.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  expect(await image.evaluate(el => getComputedStyle(el).transform)).toBe("none");
  for (const name of stages) {
    await page.getByRole("tab", { name, exact: true }).click();
    await expect(page.getByRole("tab", { name, exact: true })).toHaveAttribute("aria-selected", "true");
  }
  expect(await page.locator(".journey").evaluate(el => el.clientHeight)).toBeLessThan(600);
});

test("case-study metadata stays with the introduction and the narrative retains every stage", async ({ page }, info) => {
  await page.goto(nigeria);
  const sidebar = page.locator(".case-study-sidebar");
  await expect(sidebar).toContainText("90% Complete");
  await expect(page.locator(".case-study-narrative > section")).toHaveCount(4);
  await expect(page.locator(".case-study-article img")).toHaveCount(0);
  expect(await sidebar.evaluate(el => getComputedStyle(el).position)).toBe(info.project.name === "desktop" ? "sticky" : "static");
  if (info.project.name === "desktop") {
    await page.evaluate(() => scrollTo(0, 500));
    await expect.poll(() => sidebar.evaluate(el => Math.round(el.getBoundingClientRect().top))).toBe(156);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("project labels follow the exact muted specification and supplied photos stay complete", async ({ page }) => {
  await page.goto("/asset-management/projects");
  const styles = await page.locator('[data-kind]').evaluateAll(elements => elements.map(el => {
    const s = getComputedStyle(el); return { size: s.fontSize, weight: s.fontWeight, spacing: s.letterSpacing, color: s.color, background: s.backgroundColor, border: s.borderWidth };
  }));
  expect(styles.length).toBeGreaterThan(5);
  for (const style of styles) expect(style).toEqual({ size: "12px", weight: "550", spacing: "1.08px", color: "rgb(62, 92, 115)", background: "rgba(0, 0, 0, 0)", border: "0px" });
  await page.goto("/engineering/projects");
  const deck = page.locator('[data-image-deck="project"]');
  for (const button of await deck.getByRole("button", { name: /^Explore / }).all()) {
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const photo = deck.locator('[data-active="true"] .project-gallery-image img');
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    expect(await photo.evaluate(el => getComputedStyle(el).objectFit)).toBe("contain");
    expect(await photo.evaluate(el => getComputedStyle(el).filter)).toBe("none");
  }
});

test("sector selection expands the original image card with a subtle frame", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "Hover requires a pointer");
  await page.goto("/asset-management/sectors");
  const deck = page.locator('[data-image-deck="sector"]').first();
  const button = deck.getByRole("button", { name: /^Explore / }).last();
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await button.hover();
  await expect.poll(() => button.evaluate(el => getComputedStyle(el, "::after").borderTopColor)).toBe("rgba(255, 255, 255, 0.69)");
  await expect(deck.locator("img")).toHaveCount(4);
});
