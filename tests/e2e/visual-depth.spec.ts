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

test("reviewed photography replaces supported slots and unsupported slots stay omitted", async () => {
  expect(status.pending).toEqual([]);
  const commissioned = routes.flatMap(([, assets]) => assets.map(({ id }) => id));
  expect(commissioned).toHaveLength(16);
  expect(status.available).toHaveLength(8);
  expect(status.omitted).toHaveLength(8);
  expect([...status.available, ...status.omitted].sort()).toEqual([...commissioned].sort());
});

test("reviewed photographs load with credits, reserved space and no overflow", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [route, assets] of routes) {
    const count = assets.filter((asset) =>
      status.available.includes(asset.id),
    ).length;
    await page.goto(route);
    const frames = page.locator(".conceptual-image");
    await expect(frames).toHaveCount(count);
    const images = frames.locator("img");
    for (let index = 0; index < count; index++) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect(image).not.toHaveAttribute("alt", /conceptual|illustration/i);
      await expect(frames.nth(index).locator("..").locator('a[href^="https://commons.wikimedia.org/"]')).toHaveCount(1);
      await expect(frames.nth(index).locator("..").locator('a[href^="https://creativecommons.org/licenses/"]')).toHaveCount(1);
      // Content hashes prevent an earlier toned image sharing the new image's cache key.
      await expect(image).toHaveAttribute(
        "src",
        /\/_next\/image\?url=%2F_next%2Fstatic%2Fmedia%2F[a-z-]+\.[a-z0-9_-]+\.webp&w=\d+&q=\d+/,
      );
      expect(await image.evaluate((node) => getComputedStyle(node).filter)).toBe("none");
      await expect
        .poll(() =>
          image.evaluate(
            (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
    expect(
      await frames.evaluateAll((nodes) =>
        nodes.every((node) => {
          const box = node.getBoundingClientRect();
          const img = node.querySelector("img")!;
          return (
            box.width > 100 &&
            box.height > 100 &&
            img.getBoundingClientRect().width <= box.width + 1 &&
            getComputedStyle(img).objectFit === "cover"
          );
        }),
      ),
    ).toBe(true);
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
  for (const [route, assets] of routes) {
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
          y: node.getBoundingClientRect().top + scrollY,
          h: node.getBoundingClientRect().height,
        })),
      );
    release();
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
        y: node.getBoundingClientRect().top + scrollY,
        h: node.getBoundingClientRect().height,
      })),
    );
    expect(
      after.map(
        (box, index) =>
          Math.abs(box.y - before[index].y) + Math.abs(box.h - before[index].h),
      ),
    ).toEqual(before.map(() => 0));
    await page.unroute("**/_next/image?**");
  }
});
