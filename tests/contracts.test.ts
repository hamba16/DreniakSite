import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import data from "../src/content/brief.json";
import { scoreAssessment } from "../src/lib/assessment";
import {
  enquirySchema,
  newsletterSchema,
  readSubmission,
  consumeLimit,
} from "../src/lib/intake";
test("founder story, values, mission, vision, sectors and every service remain verbatim", () => {
  const source = readFileSync("doc/DRENIAK_SITE_BUILD_BRIEF.md", "utf8");
  assert.ok(source.includes(data.story));
  assert.ok(source.includes(data.mission));
  assert.ok(source.includes(data.vision));
  assert.equal(data.values.length, 5);
  assert.equal(data.services.length, 6);
  assert.equal(data.sectors.length, 8);
  for (const v of data.values) {
    assert.ok(source.includes(v.name));
    assert.ok(source.includes(v.text));
  }
  for (const s of data.services) {
    assert.ok(source.includes(s.name));
    assert.ok(source.includes(s.description));
    assert.ok(source.includes(s.value));
    for (const i of s.includes) assert.ok(source.includes(i));
  }
  for (const s of data.sectors) {
    assert.ok(source.includes(s.name));
    assert.ok(source.includes(s.description));
  }
});
test("assessment score spans 0–100 and rejects partial or invalid answers", () => {
  assert.equal(scoreAssessment([0, 0, 0, 0, 0, 0]).score, 0);
  assert.equal(scoreAssessment([3, 3, 3, 3, 3, 3]).score, 100);
  assert.equal(scoreAssessment([0, 1, 2, 3, 2, 1]).score, 50);
  assert.throws(() => scoreAssessment([1, 2]));
  assert.throws(() => scoreAssessment([0, 0, 0, 0, 0, 4]));
  assert.throws(() => scoreAssessment([0, 0, 0, 0, 0, NaN]));
});
test("enquiry validation prevents malformed emails, absent consent and short messages", () => {
  const valid = {
    name: "Review Example",
    email: "review@example.com",
    message: "This is a validation test enquiry.",
    division: "engineering",
    consent: true,
  };
  assert.ok(enquirySchema.safeParse(valid).success);
  for (const patch of [
    { email: "x" },
    { consent: false },
    { message: "short" },
    { division: "other" },
  ])
    assert.equal(
      enquirySchema.safeParse({ ...valid, ...patch }).success,
      false,
    );
  assert.equal(
    newsletterSchema.safeParse({ email: "review@example.com", consent: false })
      .success,
    false,
  );
});
test("request reader rejects cross-origin submissions, bad types, oversized bodies and malformed JSON", async () => {
  const req = (body: string, headers: Record<string, string> = {}) =>
    new Request("http://localhost:3000/api/enquiry", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body,
    });
  assert.equal(
    (await readSubmission(req("{}", { origin: "https://unrelated.example" })))
      .status,
    403,
  );
  assert.equal(
    (await readSubmission(req("{}", { "content-type": "text/plain" }))).status,
    415,
  );
  assert.equal((await readSubmission(req("x".repeat(16001)))).status, 413);
  assert.equal((await readSubmission(req("invalid"))).status, 400);
  assert.deepEqual((await readSubmission(req('{"ok":true}'))).data, {
    ok: true,
  });
});
test("rate limit allows five attempts and recovers after the window", () => {
  for (let i = 0; i < 5; i++)
    assert.equal(consumeLimit("test-client", 1000), true);
  assert.equal(consumeLimit("test-client", 1000), false);
  assert.equal(consumeLimit("test-client", 601001), true);
});
