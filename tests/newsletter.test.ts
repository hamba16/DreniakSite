import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { POST } from "../src/app/api/newsletter/route";
test("newsletter returns success only after email and consent are persisted", async () => {
  const base = path.resolve(".data/verification");
  await mkdir(base, { recursive: true });
  const directory = await mkdtemp(path.join(base, "newsletter-"));
  const previous = process.env.NEWSLETTER_DATA_DIR;
  const previousWebhook = process.env.NEWSLETTER_WEBHOOK_URL;
  process.env.NEWSLETTER_DATA_DIR = directory;
  delete process.env.NEWSLETTER_WEBHOOK_URL;
  try {
    const response = await POST(
      new Request("http://localhost:3000/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "Verification@Example.com",
          consent: true,
        }),
      }),
    );
    assert.equal(response.status, 200);
    const record = JSON.parse(
      (await readFile(path.join(directory, "newsletter.jsonl"), "utf8")).trim(),
    );
    assert.equal(record.email, "verification@example.com");
    assert.equal(record.consent, true);
    assert.equal(record.source, "dreniak-website");
    assert.ok(record.createdAt);
    const invalid = await POST(
      new Request("http://localhost:3000/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "bad", consent: false }),
      }),
    );
    assert.equal(invalid.status, 400);
    assert.equal(
      (await readFile(path.join(directory, "newsletter.jsonl"), "utf8"))
        .trim()
        .split("\n").length,
      1,
    );
  } finally {
    if (previous === undefined) delete process.env.NEWSLETTER_DATA_DIR;
    else process.env.NEWSLETTER_DATA_DIR = previous;
    if (previousWebhook === undefined)
      delete process.env.NEWSLETTER_WEBHOOK_URL;
    else process.env.NEWSLETTER_WEBHOOK_URL = previousWebhook;
  }
});
