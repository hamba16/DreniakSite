import { test, expect, type Locator } from "@playwright/test";
import { engineering } from "../../src/content/engineering";
import data from "../../src/content/brief.json";

async function expectUnclipped(locator: Locator) {
  const clipped = await locator.evaluateAll((elements) =>
    elements.flatMap((element) => {
      const box = element.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(element);
      const lines = [...range.getClientRects()];
      const overflows =
        element.scrollWidth > element.clientWidth + 1 ||
        element.scrollHeight > element.clientHeight + 1;
      return box.width < 50 ||
        overflows ||
        lines.some(
          (line) => line.left < box.left - 1 || line.right > box.right + 1,
        )
        ? [element.textContent]
        : [];
    }),
  );
  expect(clipped).toEqual([]);
}

test("service icons and full titles work at desktop, mobile and narrow widths", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  const widths =
    testInfo.project.name === "mobile" ? [320, 375, 390, 768] : [1440];
  for (const width of widths) {
    await page.setViewportSize({
      width,
      height: testInfo.project.name === "mobile" ? 844 : 1000,
    });
    await page.goto("/asset-management/services");
    await expect(page.locator(".service-index")).toHaveCount(0);
    await expect(page.locator(".service-icon")).toHaveCount(6);
    for (let index = 0; index < data.services.length; index++) {
      const title = page.locator(".service-title").nth(index);
      await expect(title).toContainText(data.services[index].name);
      await expect(page.locator(".service-icon").nth(index)).toBeVisible();
      const trigger = page.locator(".service h2 button").nth(index);
      if ((await trigger.getAttribute("aria-expanded")) !== "true")
        await trigger.click();
      await expect(page.locator(`#service-${index}`)).toBeVisible();
    }
    await expectUnclipped(page.locator(".service-title"));
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.goto("/asset-management");
    await expect(
      page.locator(".service-preview-grid .category-icon svg"),
    ).toHaveCount(6);
    await expectUnclipped(page.locator(".service-preview-grid h3"));
    await expect(page.locator(".stage-number")).toHaveCount(0);
    await expect(page.getByRole("tab")).toHaveCount(6);
    await expect(page.locator(".stage-arrow")).toHaveCount(6);
    const surfaces = page.locator(
      ".service-preview-grid, .journey-tabs, .journey-explanation",
    );
    expect(
      await surfaces.evaluateAll((els) =>
        els.every((el) => el.scrollWidth <= el.clientWidth + 1),
      ),
    ).toBe(true);
    await expect(page.locator(".service-preview-grid")).not.toContainText(
      /\b0[1-6]\b/,
    );
    await expect(page.locator(".journey")).not.toContainText(/\b0[1-6]\b/);
    await page.screenshot({
      path: `test-results/refinement-${width}-preview.png`,
      fullPage: true,
    });
  }
});

test("all eight sectors share icons without category numerals", async ({
  page,
}) => {
  await page.goto("/asset-management/sectors");
  await expect(page.locator(".sector-top > svg")).toHaveCount(4);
  await expect(page.locator(".sector-secondary article > svg")).toHaveCount(4);
  await expect(page.locator(".sector-top > span")).toHaveCount(0);
  await expectUnclipped(
    page.locator(".sector-featured h3, .sector-secondary h3"),
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

test("Engineering content, registrations and About order match the agreed brief", async ({
  page,
}) => {
  await page.goto("/engineering/about");
  await expect(page.locator("#engineering-mission + p")).toHaveText(
    engineering.mission,
  );
  await expect(page.locator("#engineering-vision + p")).toHaveText(
    engineering.vision,
  );
  await expect(page.locator(".engineering-overview .story-lead")).toHaveText(
    engineering.description,
  );
  await expect(page.locator(".engineering-value-grid h3")).toHaveText(
    engineering.values,
  );
  const ids = await page
    .locator('h2[id^="engineering-"]')
    .evaluateAll((els) => els.map((el) => el.id));
  expect(ids).toEqual([
    "engineering-overview",
    "engineering-mission",
    "engineering-vision",
    "engineering-values",
    "engineering-philosophy",
    "engineering-expertise",
    "engineering-leadership",
    "engineering-credentials",
    "engineering-commitment",
  ]);
  await expect(page.locator(".standards-section")).toContainText(
    "Engineers Registration Board",
  );
  for (const label of ["URSB", "URA", "trading license"])
    await expect(page.locator(".standards-section")).toContainText(label);
  // Leadership contacts are confirmed; portraits and biographies remain a content follow-up.
  await expect(page.locator(".leadership")).toContainText("Leadership & team");
  await expect(page.locator(".leadership")).toContainText("Derrick Nkurunungi");
  await expect(page.locator(".footprint-graphic")).toBeVisible();
  await page.goto("/engineering/sectors");
  await expect(page.locator(".engineering-sector-lead h2")).toHaveText(
    engineering.featuredSector,
  );
  await expect(page.locator(".engineering-sector-grid h3")).toHaveText(
    engineering.sectors,
  );
  await page.goto("/engineering/insights");
  await expect(page.locator(".insight-categories span")).toHaveText(
    engineering.insightCategories,
  );
  await page.goto("/engineering/careers");
  await expect(
    page.getByRole("heading", { name: "No current openings." }),
  ).toBeVisible();
});

test("Engineering consultation carries sector context and confirmed services through the existing API", async ({
  page,
}) => {
  await page.goto("/engineering/sectors");
  await page
    .locator(".engineering-sector-lead")
    .getByRole("link", { name: "Book a Consultation" })
    .click();
  await expect(page).toHaveURL(
    /\/engineering\/consultation\?sector=Construction%20Engineering/,
  );
  await expect(
    page.getByRole("textbox", { name: /Conversation context/ }),
  ).toHaveValue("Sector: Construction Engineering");
  await expect(
    page.locator('a[href="https://wa.me/256704175005"]').first(),
  ).toBeVisible();
  await expect(
    page.locator('a[href="tel:+256704175005"]').first(),
  ).toBeVisible();
  await page.getByLabel("Your name", { exact: true }).fill("Review Example");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("review@example.com");
  await page
    .getByLabel("What would you like to discuss?")
    .selectOption("Construction");
  await page
    .getByLabel("Tell us about your project, site or engineering challenge", {
      exact: true,
    })
    .fill("Local verification of the engineering consultation form.");
  await page.getByRole("checkbox").check();
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/enquiry") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Request a consultation" }).click();
  const response = await responsePromise;
  expect(response.request().postDataJSON()).toMatchObject({
    division: "engineering",
    interest: "Construction",
    context: "Sector: Construction Engineering",
    consent: true,
  });
  expect(response.status()).toBe(503);
  await expect(page.getByRole("status").first()).toContainText(
    "not available yet",
  );
  await expect(
    page.getByRole("link", { name: "Email Darren directly" }),
  ).toBeVisible();
});
