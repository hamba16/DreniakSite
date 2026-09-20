import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { engineering, engineeringOpenings } from "../src/content/engineering";
import { getPages } from "../src/lib/site";

test("Engineering supplied description, mission, vision and named content remain verbatim", () => {
  const source = readFileSync("doc/ENGINEERING_UPDATE_BRIEF.md", "utf8");
  for (const text of [
    engineering.description,
    engineering.mission,
    engineering.vision,
    ...engineering.values,
    ...engineering.sectors,
    ...engineering.insightCategories,
    ...engineering.services.map((service) => service.name),
    ...engineering.keywords,
  ]) {
    assert.ok(
      source.includes(text),
      `Not found verbatim in the Engineering brief: ${text}`,
    );
  }
  assert.equal(engineering.services.length, 4);
  for (const service of engineering.services)
    assert.equal(service.editorialStatus, "drafted, pending client refinement");
  assert.equal(engineeringOpenings.length, 0);
});

test("new routes belong to Engineering only", () => {
  for (const page of ["careers", "consultation"] as const) {
    assert.ok(getPages("engineering").includes(page));
    assert.ok(!getPages("asset-management").includes(page));
  }
});
