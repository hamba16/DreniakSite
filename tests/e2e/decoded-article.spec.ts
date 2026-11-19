import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const route =
  "/asset-management/insights/after-the-connection-africa-electricity";

test("Dreniak Decoded renders the full article, links and metadata accessibly", async ({
  page,
}) => {
  const externalRequests: string[] = [];
  const origin = new URL(
    process.env.TEST_BASE_URL || "http://localhost:3000",
  ).origin;
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== origin)
      externalRequests.push(request.url());
  });

  const response = await page.goto(route);
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/After the connection/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("After the connection");
  await expect(
    page.getByText("Electricity access and distribution performance in Uganda", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator('[aria-label="Distribution loss rate"] svg title'),
  ).toHaveText("Distribution loss rate: 16.7% to 18.1%");
  await expect(
    page.locator('[aria-label="Distribution loss rate"] img'),
  ).toHaveCount(0);

  const tables = page.locator("table");
  await expect(tables).toHaveCount(3);
  for (const table of await tables.all()) {
    await expect(table.locator("caption")).toBeVisible();
    await expect(table.locator('th[scope="col"]')).not.toHaveCount(0);
  }
  await expect(
    page.locator("table caption").filter({
      hasText: "Table 1. ERA distribution data",
    }),
  ).toContainText(
    "Table 1. ERA distribution data and Dreniak calculations. Volumes are rounded. pp = percentage points.",
  );
  await expect(page.locator('svg[role="img"]')).toHaveCount(4);
  await expect(
    page.locator("#energy-chart-desc"),
  ).toContainText("purchased 5,815 GWh and sold 4,846 GWh");

  for (const id of ["if-you-chose-a", "if-you-chose-b"]) {
    const choice = page.locator(`#${id}`);
    await expect(choice).toBeAttached();
    await expect(choice.locator("summary")).toBeVisible();
    await expect(choice).toContainText(
      id.endsWith("-a")
        ? "We would check how long the outages lasted"
        : "We would make sure the main meter and customer meters cover",
    );
  }
  await expect(page.getByText("With only this information", { exact: false })).toBeVisible();

  const citationMarkers = page.locator('sup[id^="cite-"]');
  await expect(citationMarkers).not.toHaveCount(0);
  for (const marker of await citationMarkers.all()) {
    const links = marker.locator("a[href^='#source-']");
    await expect(links).not.toHaveCount(0);
    for (const href of await links.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    )) {
      await expect(page.locator(href!)).toHaveCount(1);
    }
  }
  for (let source = 1; source <= 6; source++) {
    const sourceRow = page.locator(`#source-${source}`);
    await expect(sourceRow).toBeAttached();
    await expect(sourceRow.locator('a[href^="#cite-"]')).not.toHaveCount(0);
  }

  const html = await page.content();
  for (const forbidden of [
    "WEBSITE PRODUCTION NOTES",
    "INTERNAL",
    "page 2",
    "ISSUE 01 /",
    "Make the decision on page 2",
  ]) {
    expect(html).not.toContain(forbidden);
  }

  await expect(
    page.locator('input[name="source"][value="insights-after-the-connection"]'),
  ).toHaveCount(1);
  await expect(
    page.getByText("Get Dreniak Decoded in your inbox, once a month."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download the research brief (PDF)" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: "Talk to Dreniak about an asset performance review →",
    }),
  ).toHaveAttribute("href", "/asset-management/contact");

  const metadata = await page.locator('script[type="application/ld+json"]').allTextContents();
  const articleData = metadata
    .map((item) => JSON.parse(item))
    .find((item) => item["@type"] === "Article");
  expect(articleData).toMatchObject({
    headline: "After the connection",
    description:
      "What Uganda's distribution losses reveal about keeping electricity reliable as Africa expands access.",
    datePublished: "2026-11",
    author: { "@type": "Organization", name: "Dreniak Limited" },
    publisher: { name: "Dreniak Limited" },
  });
  await expect(
    page.locator('link[rel="canonical"]'),
  ).toHaveAttribute(
    "href",
    /\/asset-management\/insights\/after-the-connection-africa-electricity$/,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "What Uganda's distribution losses reveal about keeping electricity reliable as Africa expands access.",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "After the connection",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain(
    "/asset-management/insights/after-the-connection-africa-electricity",
  );
  expect(externalRequests).toEqual([]);
});

test("choice links open the correct answer on load and on hashchange", async ({
  page,
}) => {
  await page.goto(`${route}#if-you-chose-a`);
  await expect(page.locator("#if-you-chose-a")).toHaveAttribute("open", "");

  await page.goto(route);
  const summary = page.locator("#if-you-chose-a > summary");
  await summary.focus();
  await summary.press("Enter");
  await expect(page.locator("#if-you-chose-a")).toHaveAttribute("open", "");
  await page.evaluate(() => {
    window.location.hash = "if-you-chose-b";
  });
  await expect(page.locator("#if-you-chose-b")).toHaveAttribute("open", "");
});

test("Asset Management Insights features Issue 01 first and the article fits target widths", async ({
  page,
}) => {
  await page.goto("/asset-management/insights");
  const featuredCard = page.locator("article.insight-card").first();
  await expect(featuredCard.getByLabel("Dreniak Decoded")).toBeVisible();
  await expect(featuredCard).toContainText("After the connection");
  await expect(featuredCard.locator("a").first()).toHaveAttribute(
    "href",
    route,
  );

  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      `No horizontal page overflow at ${width}px`,
    ).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(result.violations, `Accessibility at ${width}px`).toEqual([]);
  }
});

test("reading rail follows its anchor jump and is hidden in print", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(route);

  const rail = page.getByRole("navigation", { name: "On this page" });
  const decisionLink = rail.getByRole("link", { name: "Your decision" });
  await expect(rail).toBeVisible();
  await decisionLink.focus();
  await expect(decisionLink).toBeFocused();
  await expect(decisionLink).toHaveCSS("outline-style", "solid");
  await decisionLink.press("Enter");

  await expect.poll(
    () => rail.locator('a[aria-current="location"]').getAttribute("href"),
  ).toBe("#your-decision");
  await expect.poll(
    () =>
      page.locator("#your-decision").evaluate((section) => {
        const margin = Number.parseFloat(
          getComputedStyle(section).scrollMarginTop,
        );
        return Math.abs(section.getBoundingClientRect().top - margin);
      }),
  ).toBeLessThan(5);
  await expect(page.locator("body")).toHaveClass(/decoded-header-compact/);

  await page.emulateMedia({ media: "print" });
  await expect(rail).toBeHidden();
  await expect(page.locator('[class*="readingProgress"]')).toBeHidden();
  await expect(page.locator("#sources")).toBeVisible();
});
