import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { divisions, getPages } from "../../src/lib/site";
test("all intended pages load without broken assets, horizontal overflow or browser errors", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const routes = [
    "/",
    "/story",
    "/privacy",
    "/portal",
    "/asset-management/assessment",
    ...divisions.flatMap((d) => [
      `/${d}`,
      ...getPages(d).map((p) => `/${d}/${p}`),
    ]),
  ];
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1"), route).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      route,
    ).toBe(true);
    expect(
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          (imgs as HTMLImageElement[])
            .filter((i) => i.complete && i.naturalWidth === 0)
            .map((i) => i.src),
        ),
      route,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});
test("division gateway and switching navigate correctly", async ({ page }) => {
  await page.goto("/#divisions");
  await page.getByRole("link", { name: /Enter Engineering/ }).click();
  await expect(page).toHaveURL(/\/engineering$/);
  await page
    .getByRole("link", { name: "Our divisions", exact: false })
    .isVisible()
    .then(async (visible) => {
      if (visible) {
        await page
          .getByRole("link", { name: "Our divisions", exact: false })
          .click();
        await expect(page).toHaveURL(/#divisions$/);
      } else {
        await page.getByRole("button", { name: "Open navigation" }).click();
        await page
          .getByRole("link", { name: "Switch to Asset Management" })
          .click();
      }
    });
  if (page.url().includes("#divisions"))
    await page.getByRole("link", { name: /Enter Asset Management/ }).click();
  await expect(page).toHaveURL(/\/asset-management$/);
});
test("capability journey supports keyboard navigation and services reveal their value", async ({
  page,
}) => {
  await page.goto("/asset-management");
  const tab = page.getByRole("tab", { name: /Understand/ });
  await tab.click();
  await tab.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Manage/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByRole("tabpanel")).toContainText(
    "Make infrastructure perform better",
  );
  await page.goto("/asset-management/services");
  await page
    .getByRole("button", { name: /Infrastructure & Economic Strategy/ })
    .click();
  await expect(page.locator("#service-5")).toContainText(
    "Move from managing individual assets",
  );
});
test("assessment completes honestly and can be revised", async ({ page }) => {
  await page.goto("/asset-management/assessment");
  await expect(
    page.getByRole("button", { name: "Next question" }),
  ).toBeDisabled();
  for (let i = 0; i < 6; i++) {
    await page.getByRole("radio").nth(3).check();
    await page
      .getByRole("button", {
        name: i === 5 ? "See my result" : "Next question",
      })
      .click();
  }
  await expect(page.locator(".score")).toContainText("100");
  await expect(
    page.getByRole("heading", { name: "Refine. Integrate. Grow." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start again" }).click();
  await expect(
    page.getByRole("button", { name: "Next question" }),
  ).toBeDisabled();
});
test("contact form exposes real unavailable-delivery state without claiming success", async ({
  page,
}) => {
  await page.goto("/asset-management/contact");
  await page.getByLabel("Your name", { exact: true }).fill("Review Example");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("review@example.com");
  await page
    .getByLabel(
      "Tell us about your assets, portfolio or infrastructure challenge",
      { exact: true },
    )
    .fill("Please use this as a local verification enquiry only.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send your enquiry" }).click();
  await expect(page.getByRole("status").first()).toContainText(
    "not available yet",
  );
  await expect(
    page.getByRole("link", { name: "Email Darren directly" }),
  ).toBeVisible();
});
test("key pages satisfy automated WCAG A/AA checks", async ({ page }) => {
  test.setTimeout(180000);
  const violations: unknown[] = [];
  for (const route of [
    "/",
    "/asset-management",
    "/engineering",
    "/asset-management/contact",
    "/asset-management/assessment",
    "/portal",
    "/story",
    "/privacy",
    "/asset-management/about",
    "/asset-management/services",
    "/asset-management/sectors",
    "/asset-management/insights",
    "/engineering/about",
    "/engineering/services",
    "/engineering/sectors",
    "/engineering/careers",
    "/engineering/consultation",
  ]) {
    await page.goto(route);
    await page.waitForTimeout(1100);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    violations.push(
      ...result.violations.map((v) => ({
        route,
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    );
  }
  expect(violations).toEqual([]);
});
test("metadata, robots, sitemap, social cards and not-found responses are valid", async ({
  request,
}) => {
  for (const route of [
    "/sitemap.xml",
    "/robots.txt",
    "/favicon.ico",
    "/apple-icon.png",
    "/og/parent",
    "/og/engineering",
    "/og/asset-management",
  ]) {
    const r = await request.get(route);
    expect(r.status(), route).toBe(200);
    if (route.startsWith("/og"))
      expect(r.headers()["content-type"]).toContain("image/png");
  }
  expect((await request.get("/engineering/assessment")).status()).toBe(404);
  expect(
    (await request.get("/asset-management/insights/nonexistent")).status(),
  ).toBe(404);
});

test("service deep links open the right pillar and assessment context reaches the enquiry form", async ({
  page,
}) => {
  await page.goto("/asset-management/services#service-5");
  await expect(page.locator("#service-5")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Infrastructure & Economic Strategy/ }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.goto("/asset-management/contact?assessment=67");
  await expect(
    page.getByRole("textbox", { name: "Conversation context" }),
  ).toHaveValue("Indicative maturity assessment: 67/100 (self-reported).");
});

test("reduced-motion navigation and unavailable newsletter capture are usable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#divisions");
  await page.getByRole("link", { name: /Enter Asset Management/ }).click();
  await expect(page).toHaveURL(/\/asset-management$/);
  await expect(page.locator(".division-wipe")).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "A longer view, in your inbox." })
    .fill("review@example.com");
  await page.getByRole("button", { name: "Subscribe to newsletter" }).click();
  await expect(page.getByRole("status")).toContainText("not available yet");
});
