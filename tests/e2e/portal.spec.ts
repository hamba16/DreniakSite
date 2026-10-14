import { expect, test } from "@playwright/test";

test("portal sign-in is noindex and never mounts visitor analytics", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("dreniak-analytics", "accepted"));
  const response = await page.goto("/portal");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { name: "Work, in view." })).toBeVisible();
  await expect(page.locator('script[src*="googletagmanager.com"]')).toHaveCount(0);
  await expect(page.locator('script[src*="va.vercel-scripts.com"]')).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "Analytics preferences" })).toHaveCount(0);
});
