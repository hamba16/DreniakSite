import test from "node:test";
import assert from "node:assert/strict";
import { contentForms, contentPayload, newContent, pageAddress } from "../../src/lib/admin-content-forms";
import { schemas, type AdminResource } from "../../src/lib/admin";

test("every natural-language form produces the existing API contract", () => {
  for (const [resource, definition] of Object.entries(contentForms)) {
    const draft = newContent(resource);
    for (const field of definition.fields) {
      if (field.type === "url") draft[field.key] = "https://example.com/profile";
      else if (field.required && field.type !== "date") draft[field.key] = "Example content";
    }
    const payload = contentPayload(resource, draft);
    const result = schemas[resource as AdminResource].safeParse(payload);
    assert.ok(result.success, `${resource} does not match the server contract`);
    assert.deepEqual(Object.keys(payload).sort(), Object.keys(definition.defaults).sort());
  }
});

test("forms encode numbers, optional values, repeatable text and visibility without code input", () => {
  const draft = { ...newContent("services"), name: "Site assessment", sort_order: "2", division: "", includes: ["Inspect the site", "", "  ", "A clear report"] };
  const payload = contentPayload("services", draft);
  assert.equal(payload.sort_order, 2);
  assert.equal(payload.division, null);
  assert.equal(contentPayload("services", { ...draft, division: null }).division, null);
  assert.deepEqual(payload.includes, ["Inspect the site", "A clear report"]);
  assert.equal(contentPayload("insights", { ...newContent("insights"), is_published: false }).is_published, false);
  assert.equal(contentPayload("founder", { ...newContent("founder"), portrait_media_id: "" }).portrait_media_id, null);
});

test("edits keep IDs and existing content, while removing server metadata", () => {
  const id = "3cdeac9a-d0a1-4b09-a0fc-661c4477aa37";
  const draft = { ...newContent("services"), id, name: "Existing service", includes: ["First line\nSecond line"], editorial_status: "Internal review note", created_at: "2026-09-13" };
  const payload = contentPayload("services", draft);
  assert.equal(payload.id, id);
  assert.equal(payload.editorial_status, "Internal review note");
  assert.deepEqual(payload.includes, draft.includes);
  assert.ok(!("created_at" in payload));
  assert.ok(schemas.services.safeParse(payload).success);
  assert.equal(pageAddress("Energy & Infrastructure: A New Approach"), "energy-infrastructure-a-new-approach");
  assert.equal(pageAddress("  Café design  "), "cafe-design");
});
