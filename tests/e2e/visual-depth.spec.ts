import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import status from "../../src/content/visual-depth-status.json";
import {
  engineeringSectorImages,
  assetSectorImages,
  interventionImage,
  insightImages,
} from "../../src/content/visual-assets";

const routes = [
  ["/engineering/sectors", engineeringSectorImages],
  ["/asset-management/sectors", assetSectorImages],
  ["/engineering/projects", [interventionImage]],
  ["/engineering/insights", [insightImages.engineering]],
  ["/asset-management/insights", [insightImages["asset-management"]]],
] as const;

test("sector and editorial image slots are fully mapped", async () => {
  expect(status.pending).toEqual([]);
  const commissioned = routes.flatMap(([, assets]) => assets.map(({ id }) => id));
  expect(commissioned).toHaveLength(16);
  expect(status.available).toHaveLength(16);
  expect(status.omitted).toEqual([]);
  expect([...status.available, ...status.pending, ...status.omitted].sort()).toEqual([...commissioned].sort());
});

test("sector galleries and editorial images load in their existing frames", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [route, assets] of routes) {
    await page.goto(route);
    if (route.endsWith("/sectors")) {
      const gallery = page.locator('section[aria-label="Gallery selection"]').first();
      const tabs = gallery.getByRole("tab");
      await expect(tabs).toHaveCount(assets.length);
      for (const [index, asset] of assets.entries()) {
        await tabs.nth(index).hover();
        const image = gallery.locator(`img[alt="${asset.alt}"]`);
        await expect(image).toBeVisible();
        await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
        const fit = await image.evaluate(node => getComputedStyle(node).objectFit);
        expect(fit).toBe("contain");
        if (asset.imageNote || asset.rightsPending) {
          await expect(gallery.locator('[aria-label="Image attribution"]')).toHaveCount(0);
        }
      }
    } else {
      const asset = assets[0];
      const frame = page.locator(".conceptual-image");
      await expect(frame).toHaveCount(1);
      const image = frame.locator("img");
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveAttribute("alt", asset.alt);
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
      expect(await image.evaluate(node => getComputedStyle(node).objectFit)).toBe("contain");
      const bounds = await frame.boundingBox();
      expect(bounds!.width).toBeGreaterThan(100);
      expect(bounds!.height).toBeGreaterThan(100);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      route,
    ).toBe(true);
    const violations = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      violations.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      route,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("Engineering tags and framework are consistent while other pages retain their treatment", async ({
  page,
}) => {
  await page.goto("/engineering/insights");
  const tags = page.getByRole("list", {
    name: "Engineering insight categories",
  });
  await expect(tags.getByRole("listitem")).toHaveCount(8);
  expect(
    await tags
      .getByRole("listitem")
      .evaluateAll((nodes) =>
        nodes.every((node) => node.scrollWidth <= node.clientWidth + 1),
      ),
  ).toBe(true);
  await expect(tags.getByRole("button")).toHaveCount(0);
  await page.goto("/engineering/projects");
  await expect(page.locator(".project-stage-icon")).toHaveCount(4);
  await expect(page.locator(".case-framework > div > span")).toHaveCount(0);
  await expect(page.locator(".case-framework h3")).toHaveText([
    "Problem",
    "Intervention",
    "Result",
    "Long-term Value",
  ]);
  for (const route of [
    "/engineering/about",
    "/asset-management/about",
    "/asset-management/projects",
    "/engineering",
    "/asset-management",
    "/",
  ]) {
    await page.goto(route);
    await expect(page.locator(".conceptual-image")).toHaveCount(0);
    if (route === "/asset-management/projects")
      await expect(page.locator(".case-framework > div > span")).toHaveCount(4);
  }
});

test("slow image responses do not move surrounding content", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [route, assets] of routes.slice(2)) {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/_next/image?**", async (request) => {
      await gate;
      await request.continue();
    });
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    // Streaming React can briefly retain hidden copies of a boundary. Measure
    // rendered frames only, not detached/hidden copies captured by locator.all().
    const frames = page.locator(".conceptual-image:visible");
    await expect(frames).toHaveCount(assets.filter(asset => status.available.includes(asset.id)).length);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const before = await frames
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          h: node.getBoundingClientRect().height,
        })),
      );
    release();
    await page.mouse.move(0, 0);
    for (const img of await frames.locator("img").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          img.evaluate(
            (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    const after = await frames.evaluateAll((nodes) =>
      nodes.map((node) => ({
        h: node.getBoundingClientRect().height,
      })),
    );
    expect(after.map((box) => box.h), route).toEqual(before.map((box) => box.h));
    await page.unroute("**/_next/image?**");
  }
});
