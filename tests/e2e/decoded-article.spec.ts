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
    const tab = page.locator(`#${id}-tab`);
    const panel = page.locator(`#${id}-panel`);
    await expect(tab).toBeVisible();
    await expect(tab).toHaveAttribute("aria-selected", "false");
    await expect(panel).toBeAttached();
    await expect(panel).toBeHidden();
    await expect(panel).toContainText(
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

test("decision tabs support keyboard and hash navigation", async ({
  page,
}) => {
  await page.goto(`${route}#if-you-chose-a`);
  const tabA = page.locator("#if-you-chose-a-tab");
  const tabB = page.locator("#if-you-chose-b-tab");
  await expect(tabA).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#if-you-chose-a-panel")).toBeVisible();

  await page.goto(route);
  await tabA.focus();
  await expect(tabA).toHaveCSS("outline-style", "solid");
  await tabA.press("Enter");
  await expect(tabA).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#if-you-chose-a-panel")).toBeVisible();
  await tabA.press("ArrowRight");
  await expect(tabB).toBeFocused();
  await expect(tabB).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#if-you-chose-b-panel")).toBeVisible();

  await page.evaluate(() => {
    window.location.hash = "if-you-chose-a";
  });
  await expect(tabA).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#if-you-chose-a-panel")).toBeVisible();
});

test("decision fallback keeps all answers visible without JavaScript and in print", async ({
  browser,
  page,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await context.newPage();
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
  await noJsPage.goto(new URL(route, baseUrl).toString());
  const noJsStatic = noJsPage.locator('[class*="decisionStatic"]');
  await expect(
    noJsPage.locator('[class*="decisionInteractive"]'),
  ).toBeHidden();
  await expect(noJsStatic).toBeVisible();
  await expect(noJsStatic.locator("details")).toHaveCount(2);
  await expect(noJsStatic).toContainText(
    "We would make sure the main meter and customer meters cover",
  );
  await expect(noJsPage.locator("#main")).toContainText(
    "Research brief: Electricity access and distribution performance in Uganda",
  );
  await expect(noJsPage.locator("#main")).not.toContainText("Loading insight");
  await context.close();

  await page.goto(route);
  await page.emulateMedia({ media: "print" });
  const printStatic = page.locator('[class*="decisionStatic"]');
  await expect(page.locator('[class*="decisionInteractive"]')).toBeHidden();
  await expect(printStatic).toBeVisible();
  await expect(printStatic.locator("details > p")).toHaveCount(2);
  await expect(printStatic).toContainText(
    "We would check how long the outages lasted",
  );
  await expect(page.locator("#sources")).toBeVisible();
});

test("energy table rows highlight chart series and gap segments", async ({
  page,
}) => {
  await page.goto(route);
  const rows = page.locator("tr[data-energy-row]");
  const chart = page.locator('[data-decoded-graphic="energy-chart"] svg');
  await expect(rows).toHaveCount(3);
  await expect(chart).not.toHaveAttribute("data-energy-selection", /.+/);

  const purchasedRow = rows.filter({ hasText: "Energy purchased" });
  const soldRow = rows.filter({ hasText: "Energy sold" });
  const gapRow = rows.filter({ hasText: "Purchase–sales gap" });
  await page.locator("#cite-brief-table a").focus();
  await page.keyboard.press("Tab");
  await expect(purchasedRow).toBeFocused();
  await expect(purchasedRow).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(chart).toHaveAttribute("data-energy-selection", "purchased");
  await expect(
    chart.locator('[data-energy-series="sold"]').first(),
  ).toHaveCSS("opacity", "0.24");
  await expect(
    chart.locator('[data-energy-series="purchased"]').first(),
  ).toHaveCSS("opacity", "1");

  await soldRow.click();
  await expect(chart).toHaveAttribute("data-energy-selection", "sold");
  await expect(
    chart.locator('[data-energy-series="purchased"]').first(),
  ).toHaveCSS("opacity", "0.24");
  await soldRow.focus();
  await page.keyboard.press("Tab");
  await expect(gapRow).toBeFocused();
  await expect(gapRow).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(chart).toHaveAttribute("data-energy-selection", "gap");
  const gap2024 = chart.locator('[data-energy-gap="2024"]');
  await expect(gap2024).toHaveCount(1);
  const geometry = await gap2024.evaluate((gap) => {
    const rect = gap as SVGRectElement;
    return {
      start: Number(rect.getAttribute("x")),
      width: Number(rect.getAttribute("width")),
    };
  });
  const soldBar = await chart
    .locator('[data-energy-series="sold"][data-energy-year="2024"]')
    .evaluate((bar) => ({
      end:
        Number(bar.getAttribute("x")) + Number(bar.getAttribute("width")),
    }));
  const purchasedBar = await chart
    .locator('[data-energy-series="purchased"][data-energy-year="2024"]')
    .evaluate((bar) => ({
      end:
        Number(bar.getAttribute("x")) + Number(bar.getAttribute("width")),
    }));
  expect(Math.abs(geometry.start - soldBar.end)).toBeLessThan(0.1);
  expect(Math.abs(geometry.start + geometry.width - purchasedBar.end)).toBeLessThan(
    0.1,
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await chart
      .locator('[data-energy-series="purchased"]')
      .first()
      .evaluate((element) =>
        getComputedStyle(element)
          .transitionDuration.split(",")
          .every((duration) => Number.parseFloat(duration) <= 0.001),
      ),
  ).toBe(true);
  await page.reload();
  await expect(chart).not.toHaveAttribute("data-energy-selection", /.+/);
  await expect(chart.locator("[data-energy-gap]")).toHaveCount(0);
});

test("question checklist updates its three-segment indicator without extra copy", async ({
  page,
}) => {
  await page.goto(route);
  const questions = page.getByRole("checkbox");
  const segments = page.locator('[class*="questionProgress"] > span');
  await expect(questions).toHaveCount(3);
  await expect(segments).toHaveCount(3);
  await expect(questions.nth(0)).toHaveAccessibleName("Where is the service problem?");
  await expect(segments.nth(0)).not.toHaveCSS("background-color", "rgb(153, 25, 35)");

  await questions.nth(0).check();
  await expect(segments.nth(0)).toHaveCSS(
    "background-color",
    "rgb(153, 25, 35)",
  );
  await expect(segments.nth(1)).not.toHaveCSS(
    "background-color",
    "rgb(153, 25, 35)",
  );
  await questions.nth(0).focus();
  await page.keyboard.press("Tab");
  await expect(questions.nth(1)).toBeFocused();
  await expect(questions.nth(1)).toHaveCSS("outline-style", "solid");
  await questions.nth(1).press("Space");
  await expect(questions.nth(1)).toBeChecked();
  await expect(segments.nth(1)).toHaveCSS(
    "background-color",
    "rgb(153, 25, 35)",
  );
  await questions.nth(2).check();
  await expect(segments.nth(2)).toHaveCSS(
    "background-color",
    "rgb(153, 25, 35)",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await segments.nth(0).evaluate((element) =>
      getComputedStyle(element)
        .transitionDuration.split(",")
        .every((duration) => Number.parseFloat(duration) <= 0.001),
    ),
  ).toBe(true);
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
