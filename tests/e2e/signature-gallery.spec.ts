import { expect, test } from "@playwright/test";

for (const route of ["/engineering/sectors", "/asset-management/sectors"]) {
  test(`${route}: signature gallery supports keyboard selection and pauses after interaction`, async ({ page }) => {
    test.setTimeout(45000);
    await page.goto(route);
    const gallery = page.locator('section[aria-label="Gallery selection"]').first();
    const tabs = gallery.getByRole("tab");
    expect(await tabs.count()).toBeGreaterThan(1);
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");

    const photoSectors = route === "/engineering/sectors"
      ? [
          { label: /Highway and Transportation Engineering/, alt: "Daylight view of Nairobi Expressway concrete viaducts", credit: "Bahnfrend" },
          { label: /Architecture and Structural Engineering/, alt: "Britam Tower and surrounding commercial buildings in Nairobi", credit: "Daniel Case" },
          { label: /Water Resources Engineering/, alt: "Kariba Dam and reservoir between Zambia and Zimbabwe", credit: "Manfidza" },
          { label: /Project Management/, alt: "Apartment flats under construction with red-tiled roofs and timber scaffolding" },
          { label: /Materials and Geotechnical Engineering/, alt: "Geotechnical drilling rig and engineers reviewing recovered soil cores at an investigation site" },
        ]
      : [
          { label: /Government & National Infrastructure/, alt: "Parliament building of the Republic of Uganda", credit: "Andrew Regan" },
          { label: /Energy & Utilities/, alt: "Kariba Dam and its reservoir", credit: "Manfidza" },
          { label: /Transport & Mobility/, alt: "Standard Gauge Railway terminal at Mombasa", credit: "Martin Chomba" },
          { label: /Cities & Urban Infrastructure/, alt: "Nairobi skyline viewed from Uhuru Park in 2009", credit: "Jorge Láscar" },
          { label: /Real Estate & Major Developments/, alt: "Britam Tower and surrounding commercial buildings in Nairobi", credit: "Daniel Case" },
          { label: /Industrial, Manufacturing & Logistics/, alt: "Aerial view of Tanger Med port and cargo infrastructure", credit: "Tanger Med" },
          { label: /Healthcare & Social Infrastructure/, alt: "AI-generated conceptual illustration of a modern healthcare facility", credit: "AI-generated conceptual illustration." },
          { label: /Education & Institutional Estates/, alt: "AI-generated conceptual illustration of a university campus", credit: "AI-generated conceptual illustration." },
        ];

    for (const sector of photoSectors) {
      const sectorTab = gallery.getByRole("tab", { name: sector.label });
      await sectorTab.hover();
      await expect(sectorTab).toHaveAttribute("aria-selected", "true");
      const sectorImage = gallery.locator(`img[alt="${sector.alt}"]`);
      await expect(sectorImage).toBeVisible();
      if (sector.label.toString().includes("Materials and Geotechnical")) {
        await expect(sectorImage).toHaveAttribute("src", /engineering-geotechnical\.webp/);
      }
      await expect(gallery.locator('[aria-label="Image attribution"]')).toHaveCount(0);
    }

    await tabs.nth(1).focus();
    await tabs.nth(1).press("Space");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    const leaflet = page.getByRole("dialog");
    await expect(leaflet).toBeVisible();
    await expect(leaflet.locator("h2")).toHaveText(route === "/engineering/sectors" ? "Architecture and Structural Engineering" : "Energy & Utilities");
    const attribution = leaflet.locator("details");
    await expect(attribution).toBeVisible();
    await expect(attribution).not.toHaveAttribute("open", "");
    await attribution.locator("summary").click();
    await expect(attribution).toContainText(route === "/engineering/sectors" ? "Daniel Case" : "Manfidza");
    await page.getByRole("button", { name: "Close image details" }).click();
    await page.waitForTimeout(7200);
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  });
}