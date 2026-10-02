import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  test(`gallery composition and viewer fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/engineering/projects");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const hero = await page.locator(".project-hero").boundingBox();
    expect(hero!.width / hero!.height).toBeCloseTo(width < 640 ? 4 / 5 : width < 1024 ? 16 / 9 : 21 / 9, 2);
    const proportions = await page.locator('.project-bento-media').evaluateAll(media => {
      return media.map(element => {
        const dimensions = getComputedStyle(element).aspectRatio.split('/').map(Number);
        const box = element.getBoundingClientRect();
        return Math.abs(box.width / box.height - dimensions[0] / dimensions[1]);
      });
    });
    expect(proportions.every(difference => difference < .01)).toBe(true);
    await page.locator(".project-bento-tile").first().click();
    const dialog = page.getByRole("dialog");
    for (let index = 0; index < 8; index++) {
      const image = await dialog.locator("img").boundingBox();
      const caption = await dialog.locator(".project-lightbox-caption").boundingBox();
      expect(image!.width).toBeLessThanOrEqual(width * .9 + 1);
      expect(image!.y).toBeGreaterThanOrEqual(0);
      expect(image!.y + image!.height).toBeLessThanOrEqual(caption!.y + 1);
      expect(caption!.y + caption!.height).toBeLessThanOrEqual(width === 390 ? 844 : 1000);
      await page.keyboard.press("ArrowRight");
    }
    await page.keyboard.press("Escape");
    await expect(page.locator('.switch-link[href="/asset-management"]').first()).toBeAttached();
  });
}

test("gallery keyboard navigation traps focus and restores it without moving the page", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/engineering/projects");
  const tile = page.locator(".project-bento-tile").nth(3);
  await tile.scrollIntoViewIfNeeded();
  await tile.focus();
  const before = await page.evaluate(() => ({ scrollY, width: document.documentElement.clientWidth }));
  await tile.press("Space");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "Close image viewer" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator(".project-lightbox-index")).toHaveText("05 / 08");
  await expect(dialog.getByRole("status")).toContainText("5 of 8");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.locator(".project-lightbox-index")).toHaveText("04 / 08");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(tile).toBeFocused();
  expect(await page.evaluate(() => ({ scrollY, width: document.documentElement.clientWidth }))).toEqual(before);
  await tile.press("Enter");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
});

test("touch swipes navigate, vertical drags stay put, and reduced motion stops movement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/engineering/projects");
  const tile = page.locator(".project-bento-tile").first();
  await tile.hover();
  expect(await tile.locator("img").evaluate(el => getComputedStyle(el).transform)).toBe("none");
  expect(await tile.locator(".project-bento-badge").evaluate(el => getComputedStyle(el).display)).toBe("none");
  await tile.click();
  const stage = page.locator(".project-lightbox-stage");
  // Dispatch to exercise the handler even in the desktop browser project.
  await stage.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 1, clientX: 200, clientY: 200 });
  await stage.dispatchEvent("pointerup", { pointerType: "touch", pointerId: 1, clientX: 110, clientY: 205 });
  await expect(page.locator(".project-lightbox-index")).toHaveText("02 / 08");
  await stage.dispatchEvent("pointerdown", { pointerType: "touch", pointerId: 1, clientX: 200, clientY: 200 });
  await stage.dispatchEvent("pointerup", { pointerType: "touch", pointerId: 1, clientX: 110, clientY: 310 });
  await expect(page.locator(".project-lightbox-index")).toHaveText("02 / 08");
  await page.keyboard.press("Escape");
  await expect(page.locator(".project-hero")).toHaveAttribute("data-paused", "true");
  const next = page.getByRole("button", { name: "Next featured image" });
  await next.click();
  await expect(page.locator('.project-hero-slide[data-active="true"] h3')).toHaveText("Concrete facade and balcony detail");
  await page.getByRole("button", { name: /View photograph: Concrete facade/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("autoplay dwells, pauses on focus, and honours the explicit pause control", async ({ page }) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/engineering/projects");
  const active = page.locator('.project-hero-slide[data-active="true"] h3');
  await expect(active).toHaveText("Concrete apartment front under construction");
  await expect(active).toHaveText("Concrete facade and balcony detail", { timeout: 10000 });
  await page.getByRole("button", { name: "Previous featured image" }).focus();
  const focusedCaption = await active.textContent();
  await page.waitForTimeout(6800);
  await expect(active).toHaveText(focusedCaption!);
  await page.getByRole("button", { name: "Pause slideshow" }).click();
  await page.getByRole("heading", { name: "Structure, in perspective.", exact: true }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(6800);
  await expect(active).toHaveText(focusedCaption!);
});

test("page and open lightbox have no serious or critical accessibility violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/engineering/projects");
  for (const open of [false, true]) {
    if (open) await page.locator(".project-bento-tile").first().click();
    const result = await new AxeBuilder({ page }).analyze();
    expect(result.violations.filter(v => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  }
});

test("Tab reaches every photograph and Enter opens each viewer without pointer input", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/engineering/projects");
  const reached: number[] = [];
  for (let step = 0; step < 70 && reached.length < 8; step++) {
    await page.keyboard.press("Tab");
    const index = await page.evaluate(() => document.activeElement?.classList.contains("project-bento-tile") ? Number((document.activeElement as HTMLElement).dataset.index) : null);
    if (index === null) continue;
    reached.push(index);
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".project-lightbox-index")).toHaveText(`${String(index + 1).padStart(2, "0")} / 08`);
    await page.keyboard.press("Escape");
    await expect(page.locator(".project-bento-tile").nth(index)).toBeFocused();
  }
  expect(reached).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
});
