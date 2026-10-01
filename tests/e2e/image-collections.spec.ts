import { expect, test } from "@playwright/test";

for (const route of ["/story", "/engineering/about"]) {
  test(`${route}: original cards expand in place without duplicate images`, async ({ page }, info) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(route);
    const decks = page.locator("[data-image-deck]");
    expect(await decks.count()).toBeGreaterThan(0);
    await expect(page.getByRole("toolbar")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "All views", exact: true })).toHaveCount(0);
    await expect(page.locator('img[src*="geotechnical-drilling"]')).toHaveCount(0);
    for (const deck of await decks.all()) {
      const deckKind = await deck.getAttribute("data-image-deck");
      await expect(deck.locator("[data-count]")).toHaveAttribute("data-ready", "true");
      const buttons = deck.getByRole("button", { name: /^Explore / });
      const count = await buttons.count();
      const imageCount = await deck.locator("[data-count] img").count();
      expect(imageCount).toBeLessThanOrEqual(count);
      const closeLeaflet = page.getByRole("button", { name: "Close image details" });
      await buttons.first().focus();
      await buttons.first().press("End");
      await expect(buttons.last()).toHaveAttribute("aria-expanded", "true");
      await expect(buttons.last()).toBeFocused();
      await buttons.last().press("ArrowRight");
      await expect(buttons.first()).toHaveAttribute("aria-expanded", "true");
      for (let index = 0; index < count; index++) {
        await buttons.nth(index).click();
        await expect(buttons.nth(index)).toHaveAttribute("aria-expanded", "true");
        const leaflet = page.getByRole("dialog");
        const title = (await buttons.nth(index).getAttribute("aria-label"))?.replace("Explore ", "");
        await expect(leaflet).toBeVisible();
        await expect(leaflet.locator("h2")).toHaveText(title || "");
        const card = deck.locator('[data-active="true"]');
        const image = card.locator("img").first();
        if (await image.count()) {
          await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
          const box = await image.boundingBox();
          if (deckKind === "people") {
            const portrait = await card.locator("[data-photo-context]").boundingBox();
            expect(Math.abs(portrait!.height / portrait!.width - 1.125)).toBeLessThan(0.02);
            expect(await image.getAttribute("srcSet")).toContain("q=90");
          } else {
            expect(box!.height).toBeLessThanOrEqual(301);
          }
          const fit = await image.evaluate(el => getComputedStyle(el).objectFit);
          expect(fit).toBe(deckKind === "people" ? "cover" : "contain");
          if (deckKind === "people") await expect(image).toHaveAttribute("src", /[?&]q=90(?:&|$)/);
        } else {
          await expect(card.getByRole("img", { name: /Schematic/ })).toBeVisible();
        }
        await expect(card.locator("h3")).toBeVisible();
        expect(await deck.locator("[data-count] img").count()).toBe(imageCount);
        await closeLeaflet.click();
        if (info.project.name === "desktop") {
          await expect.poll(async () => {
            const active = await card.boundingBox();
            const inactive = await deck.locator('[data-active="false"]').first().boundingBox();
            return active!.width / inactive!.width;
          }).toBeGreaterThan(1.5);
        }
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("project hero and bento adapt across the required widths", async ({ page }, testInfo) => {
  await page.goto("/engineering/projects");
  const hero = page.locator(".project-hero").first();
  const gallery = page.locator(".project-gallery").first();
  const tiles = gallery.locator(".project-bento-tile");
  await expect(tiles).toHaveCount(10);
  await expect(tiles.first()).toHaveAttribute("aria-label", /Open image/);
  await expect(hero.getByRole("button", { name: "Next featured image" })).toBeVisible();

  for (const width of [390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const tile of await gallery.locator(".project-bento-tile").all()) await tile.scrollIntoViewIfNeeded();
    await expect.poll(() => gallery.locator('.project-bento-tile[data-revealed="true"]').count()).toBe(10);
    await expect.poll(() => gallery.locator(".project-bento-tile img").evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    if (testInfo.project.name === "desktop") {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(550);
      await page.screenshot({ path: `tmp/gallery-final/${width}.png`, fullPage: true });
    }
    const metrics = await gallery.evaluate(root => {
      const heroBox = root.querySelector(".project-hero")!.getBoundingClientRect();
      const grid = root.querySelector(".project-bento")!;
      return {
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        heroRatio: heroBox.width / heroBox.height,
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        tileLabels: [...grid.querySelectorAll<HTMLImageElement>(".project-bento-tile img")].map(image => image.alt),
        spans: [...grid.querySelectorAll<HTMLElement>(".project-bento-tile")].map(tile => ({
          span: tile.dataset.span,
          row: tile.getBoundingClientRect().top,
          x: tile.getBoundingClientRect().left,
        })),
      };
    });
    expect(metrics.pageWidth, `${width}px overflow`).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(metrics.tileLabels.every(label => label.length > 10), `${width}px missing descriptive alt`).toBe(true);
    expect(metrics.spans.filter(tile => tile.span === "2x2")).toHaveLength(1);
    expect(metrics.spans.filter(tile => tile.span === "2x1")).toHaveLength(1);
    expect(metrics.columns).toBe(width < 561 ? 1 : width <= 900 ? 2 : 4);
    expect(metrics.heroRatio).toBeCloseTo(width < 640 ? .8 : width < 1024 ? 16 / 9 : 21 / 9, 1);
  }
});

test("hero controls work while hover pauses autoplay", async ({ page }) => {
  await page.goto("/engineering/projects");
  const hero = page.locator(".project-hero").first();
  await hero.hover();
  await expect(hero).toHaveAttribute("data-paused", "true");
  await hero.getByRole("button", { name: "Next featured image" }).click();
  await expect(hero.locator('.project-hero-slide[data-active="true"] img')).toHaveAttribute("alt", /red tiled roofs/);
  await expect(hero.locator('.project-hero-slide[data-active="true"] img')).toHaveJSProperty("complete", true);
});

test("lightbox supports keyboard navigation and returns focus", async ({ page }) => {
  await page.goto("/engineering/projects");
  const gallery = page.locator(".project-gallery").first();
  const tile = gallery.locator(".project-bento-tile").nth(2);
  await tile.focus();
  await tile.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Project photograph" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close image viewer" })).toBeFocused();
  await expect(dialog.getByRole("heading")).toHaveText("Stone-clad apartment structure");
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByRole("heading")).toHaveText("Concrete facade and balcony detail");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(tile).toBeFocused();
});

test("touch swipe navigates the full-screen image", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/engineering/projects");
  const tile = page.locator(".project-bento-tile").nth(2);
  await tile.click();
  const dialog = page.getByRole("dialog", { name: "Project photograph" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toHaveText("Stone-clad apartment structure");
  const stage = dialog.locator(".project-lightbox-stage");
  await stage.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "touch", clientX: 300, clientY: 300 });
  await stage.dispatchEvent("pointerup", { pointerId: 1, pointerType: "touch", clientX: 220, clientY: 310 });
  await expect(dialog.getByRole("heading")).toHaveText("Concrete facade and balcony detail");
});

test("lightbox image and caption stay inside desktop and mobile viewports", async ({ page }) => {
  await page.goto("/engineering/projects");
  const tile = page.locator(".project-bento-tile").first();
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await tile.click();
    const dialog = page.getByRole("dialog", { name: "Project photograph" });
    await expect(dialog).toBeVisible();
    const bounds = await dialog.locator("img").evaluate(image => {
      const imageBox = image.getBoundingClientRect();
      const captionBox = document.querySelector(".project-lightbox-caption")!.getBoundingClientRect();
      return {
        imageRight: imageBox.right,
        imageBottom: imageBox.bottom,
        imageLeft: imageBox.left,
        captionRight: captionBox.right,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        arrowsVisible: getComputedStyle(document.querySelector(".project-lightbox-nav")!).display !== "none",
      };
    });
    expect(bounds.imageLeft).toBeGreaterThanOrEqual(0);
    expect(bounds.imageRight).toBeLessThanOrEqual(bounds.viewportWidth + 1);
    expect(bounds.imageBottom).toBeLessThanOrEqual(bounds.viewportHeight + 1);
    expect(bounds.captionRight).toBeLessThanOrEqual(bounds.viewportWidth + 1);
    if (width === 390) expect(bounds.arrowsVisible).toBe(false);
    await page.keyboard.press("Escape");
  }
});

test("reduced motion disables drift, autoplay, and reveal translation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/engineering/projects");
  const gallery = page.locator(".project-gallery").first();
  await expect(gallery.locator(".project-hero")).toHaveAttribute("data-paused", "true");
  const animation = await gallery.locator(".project-hero-image").first().evaluate(image => getComputedStyle(image).animationName);
  expect(animation).toBe("none");
  await expect.poll(() => gallery.locator(".project-bento-tile").first().getAttribute("data-revealed")).toBe("true");
  const transform = await gallery.locator(".project-bento-tile").first().evaluate(tile => getComputedStyle(tile).transform);
  expect(transform).toBe("none");
});

test("team anchor links open the correct original card", async ({ page }) => {
  await page.goto("/story#jude-karamura");
  await expect(page.getByRole("button", { name: "Explore Jude Karamura", exact: true })).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#jude-karamura h3")).toBeVisible();
});
