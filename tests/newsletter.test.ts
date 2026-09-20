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
  const previousProvider = process.env.NEWSLETTER_PROVIDER;
  const previousEnabled = process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED;
  process.env.NEWSLETTER_PROVIDER = "filesystem";
  process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED = "true";
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
    assert.equal(record.consentVersion, "2026-09-10");
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
    if (previousProvider === undefined) delete process.env.NEWSLETTER_PROVIDER;
    else process.env.NEWSLETTER_PROVIDER = previousProvider;
    if (previousEnabled === undefined)
      delete process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED;
    else process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED = previousEnabled;
  }
});

test("buttondown signup upserts Supabase before syncing and treats duplicates as success", async () => {
  const previous = {
    NEWSLETTER_PROVIDER: process.env.NEWSLETTER_PROVIDER,
    NEXT_PUBLIC_NEWSLETTER_ENABLED: process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED,
    BUTTONDOWN_API_KEY: process.env.BUTTONDOWN_API_KEY,
    BUTTONDOWN_API_BASE_URL: process.env.BUTTONDOWN_API_BASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  process.env.NEWSLETTER_PROVIDER = "buttondown";
  process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED = "true";
  process.env.BUTTONDOWN_API_KEY = "test-key";
  process.env.BUTTONDOWN_API_BASE_URL = "https://api.buttondown.email/v1";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    calls.push(url);
    if (url.includes("/rest/v1/newsletter_subscribers")) {
      assert.equal(JSON.parse(String(init?.body)).consent_version, "2026-09-10");
      assert.match(String(new Headers(init?.headers).get("prefer")), /resolution=ignore-duplicates/);
      return new Response(null, { status: 201 });
    }
    return new Response(JSON.stringify({ code: "subscriber_exists" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const response = await POST(
      new Request("http://localhost:3000/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "buttondown@example.com", consent: true }),
      }),
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      ok: true,
      synced: true,
      duplicate: true,
    });
    assert.equal(calls.length, 2);
    assert.match(calls[0], /newsletter_subscribers/);
    assert.match(calls[1], /api\.buttondown\.email/);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("buttondown sync failure does not hide a successful Supabase capture", async () => {
  const previous = {
    NEWSLETTER_PROVIDER: process.env.NEWSLETTER_PROVIDER,
    NEXT_PUBLIC_NEWSLETTER_ENABLED: process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED,
    BUTTONDOWN_API_KEY: process.env.BUTTONDOWN_API_KEY,
    BUTTONDOWN_API_BASE_URL: process.env.BUTTONDOWN_API_BASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  const originalFetch = globalThis.fetch;
  process.env.NEWSLETTER_PROVIDER = "buttondown";
  process.env.NEXT_PUBLIC_NEWSLETTER_ENABLED = "true";
  process.env.BUTTONDOWN_API_KEY = "test-key";
  process.env.BUTTONDOWN_API_BASE_URL = "https://api.buttondown.email/v1";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://supabase.example";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-key";
  globalThis.fetch = async (input) =>
    String(input).includes("/rest/v1/newsletter_subscribers")
      ? new Response(null, { status: 201 })
      : new Response("upstream unavailable", { status: 503 });
  try {
    const response = await POST(
      new Request("http://localhost:3000/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "buttondown-failure@example.com", consent: true }),
      }),
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, synced: false });
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
