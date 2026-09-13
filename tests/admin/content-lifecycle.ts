import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { expect, type Browser, type BrowserContext } from "@playwright/test";
import type { PGlite } from "@electric-sql/pglite";
import { contentForms } from "../../src/lib/admin-content-forms";

export async function verifyContentForms(browser: Browser, signedIn: BrowserContext, db: PGlite, origin: string) {
  const context = await browser.newContext({ baseURL: origin, viewport: { width: 1440, height: 1000 }, extraHTTPHeaders: { "x-forwarded-for": "127.0.0.30" } });
  await context.addCookies(await signedIn.cookies());
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir("test-results", { recursive: true });
  for (const [resource, definition] of Object.entries(contentForms)) {
    await page.goto(`${origin}/admin/${resource}`);
    await expect(page.getByRole("heading", { name: definition.title, exact: true })).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0); // initial list finished loading
    await expect(page.getByLabel("Content JSON")).toHaveCount(0);
    const form = page.getByRole("form", { name: `Add ${definition.singular}`, exact: true });
    for (const field of definition.fields) {
      const input = form.getByLabel(field.label);
      if (field.type === "list") {
        const paragraphs = field.key === "body";
        await form.getByRole("button", { name: paragraphs ? "+ Add paragraph" : "+ Add included item", exact: true }).click();
        await form.getByLabel(paragraphs ? "Paragraph 1" : "Included item 1", { exact: true }).fill(paragraphs ? "First paragraph, with punctuation.\nAnd another line." : "A clear site report");
        await form.getByRole("button", { name: paragraphs ? "+ Add paragraph" : "+ Add included item", exact: true }).click();
        await form.getByLabel(paragraphs ? "Paragraph 2" : "Included item 2", { exact: true }).fill(paragraphs ? "Second paragraph." : "Follow-up recommendations");
      } else if (field.type === "checkbox") await input.uncheck();
      else if (field.type === "select") { if (field.key === "division") await input.selectOption("asset-management"); }
      else if (field.type === "portrait") await input.selectOption("");
      else if (field.type === "number") await input.fill("3");
      else if (field.type === "date") await input.fill("2026-09-13");
      else if (field.type === "url") await input.fill("https://example.com/resource");
      else if (field.key === "slug") await expect(input).toHaveValue("test-title");
      else await input.fill(`Test ${field.label.toLowerCase()}`);
    }
    if (resource === "services") await page.screenshot({ path: "test-results/content-services-desktop.png", fullPage: true });
    const saved = page.waitForResponse((response) => response.url().endsWith(`/api/admin/${resource}`) && response.request().method() === "POST");
    await form.getByRole("button", { name: `Create ${definition.singular}`, exact: true }).click();
    assert.equal((await saved).status(), 201, `${resource} create succeeded`);
    await expect(page.getByRole("status")).toContainText("created");
    const rows = (await db.query<Record<string, unknown>>(`select * from public.${resource}`)).rows;
    assert.equal(rows.length, 1);
    const item = rows[0];
    if (resource === "services") {
      assert.deepEqual(item.includes, ["A clear site report", "Follow-up recommendations"]);
      assert.equal(item.sort_order, 3); assert.equal(item.division, "asset-management");
    }
    if (resource === "insights") {
      assert.deepEqual(item.body, ["First paragraph, with punctuation.\nAnd another line.", "Second paragraph."]);
      assert.equal(item.slug, "test-title"); assert.equal(item.is_published, false);
    }
    if (resource === "founder") assert.equal(item.portrait_media_id, null);
  }
  await page.goto(`${origin}/admin/services`);
  const record = page.locator(".content-record-list article").filter({ hasText: "Test service name" });
  await record.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByLabel("Included item 1", { exact: true })).toHaveValue("A clear site report");
  await page.getByLabel("Service name").fill("Updated service");
  await page.getByLabel("Division").selectOption("");
  await page.getByRole("button", { name: "Remove item 2", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Service updated.");
  const changed = (await db.query<{ name: string; includes: string[]; division: string | null }>("select name, includes, division from public.services")).rows[0];
  assert.equal(changed.name, "Updated service"); assert.equal(changed.division, null); assert.deepEqual(changed.includes, ["A clear site report"]);
  // Failure leaves entered content intact and can be retried without rewriting it.
  await page.getByLabel("Service name").fill("Retry service");
  await page.route("**/api/admin/services", async (route) => {
    if (route.request().method() === "POST") await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Could not save. Please try again." }) });
    else await route.continue();
  });
  await page.getByRole("button", { name: "Create service", exact: true }).click();
  await expect(page.locator(".content-manager").getByRole("alert")).toContainText("Could not save");
  await expect(page.getByLabel("Service name")).toHaveValue("Retry service");
  await page.unroute("**/api/admin/services");
  await page.getByRole("button", { name: "Create service", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Service created.");
  const retry = page.locator(".content-record-list article").filter({ hasText: "Retry service" });
  page.once("dialog", (dialog) => dialog.dismiss());
  await retry.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(retry).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await retry.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(retry).toHaveCount(0);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${origin}/admin/sectors`);
  await expect(page.getByRole("button", { name: "Create sector", exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/content-sectors-mobile.png", fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByLabel("Sector name")).toHaveValue("Test sector name");
  await page.getByLabel("Sector name").fill("Updated sector on mobile");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Sector updated.");
  assert.equal((await db.query<{ name: string }>("select name from public.sectors")).rows[0].name, "Updated sector on mobile");
  assert.deepEqual(errors, []);
  console.log("PASS: all eight content forms create through real APIs and PostgreSQL; lists, visibility, dates, links, shared division and numeric order; edit, retained input on failure, retry, confirmed deletion and 375px mobile editing.");
}
