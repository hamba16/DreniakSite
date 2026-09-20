import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { consumePublicLimit } from "../src/lib/public-rate-limit";
import { POST as enquiry } from "../src/app/api/enquiry/route";
import { POST as newsletter } from "../src/app/api/newsletter/route";

test("shared limiter migration enforces five attempts, expiry, isolated keys and private access", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to service_role;");
    await db.exec("create table public.newsletter_subscribers(email text primary key, consent_version text default 'old');");
    await db.exec(await readFile("supabase/migrations/20260920173005_public_intake_limits.sql", "utf8"));
    await db.exec("set role service_role");
    const take = async (key: string) => (await db.query<{allowed:boolean}>("select public.consume_public_limit($1) as allowed", [key.repeat(64)])).rows[0].allowed;
    const results = await Promise.all(Array.from({length:12}, () => take("a")));
    assert.equal(results.filter(Boolean).length, 5);
    assert.equal(await take("b"), true);
    await db.exec("update public.public_intake_limits set expires_at = now() - interval '1 second'");
    assert.equal(await take("a"), true);
    await db.exec("reset role; set role anon");
    await assert.rejects(take("a"), /permission denied/);
    await assert.rejects(db.query("select * from public.public_intake_limits"), /permission denied/);
    await db.exec("reset role; set role authenticated");
    await assert.rejects(take("a"), /permission denied/);
  } finally { await db.close(); }
});

test("distributed adapter hashes client identifiers and both endpoints fail closed", async () => {
  const saved = { ...process.env };
  const original = globalThis.fetch;
  try {
    process.env.RATE_LIMIT_STORE = "supabase";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://db.example";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test";
    globalThis.fetch = async (input, init) => {
      assert.match(String(input), /rpc\/consume_public_limit/);
      assert.match(JSON.parse(String(init?.body)).bucket_key, /^[a-f0-9]{64}$/);
      assert.ok(!String(init?.body).includes("192.0.2.1"));
      return Response.json(false);
    };
    assert.equal(await consumePublicLimit("enquiry:192.0.2.1"), false);
    globalThis.fetch = async () => Response.json({message:"unavailable"}, {status:503});
    assert.equal(await consumePublicLimit("x"), null);
    for (const [handler, body] of [[newsletter, {email:"test@example.com",consent:true}], [enquiry, {name:"Test Person",email:"test@example.com",message:"A sufficiently long test message.",division:"engineering",consent:true}]] as const) {
      const response = await handler(new Request("https://dreniak.com/api/test", {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}));
      assert.equal(response.status,503);
    }
    process.env.RATE_LIMIT_STORE = "typo";
    assert.equal(await consumePublicLimit("x"), null);
  } finally { globalThis.fetch=original; process.env=saved; }
});
