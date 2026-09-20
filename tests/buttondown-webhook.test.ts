import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { POST } from "../src/app/api/webhooks/buttondown/route";

test("signed unsubscribe reconciles by subscriber ID, retries safely and rejects forged input", async () => {
  const saved = { ...process.env };
  const original = globalThis.fetch;
  process.env.BUTTONDOWN_WEBHOOK_SIGNING_KEY = "test-signing-key";
  process.env.BUTTONDOWN_API_KEY = "test-api-key";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://db.example";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  let state = "unsubscribed", writes = 0, fail = false;
  const request = (body = JSON.stringify({event_type:"subscriber.unsubscribed", data:{subscriber:"sub_example"}}), signature?: string) => new Request("https://dreniak.com/api/webhooks/buttondown", {
    method:"POST", headers:{"x-buttondown-signature":signature ?? `sha256=${createHmac("sha256", "test-signing-key").update(body).digest("hex")}`}, body,
  });
  globalThis.fetch = async (input, init) => {
    if (String(input).includes("/subscribers/sub_example")) return Response.json({email_address:"Member@Example.com",type:state});
    assert.match(String(input), /email=eq.member%40example.com/);
    assert.equal(init?.method,"PATCH");
    assert.deepEqual(JSON.parse(String(init?.body)), {status:"unsubscribed"});
    writes++;
    return fail ? Response.json({message:"failure"},{status:503}) : new Response(null,{status:204});
  };
  try {
    assert.equal((await POST(request(undefined,"sha256="+"0".repeat(64)))).status,401);
    assert.equal(writes,0);
    assert.equal((await POST(request("not json"))).status,400);
    assert.equal((await POST(request("x".repeat(16001)))).status,413);
    assert.equal((await POST(request())).status,200);
    assert.equal((await POST(request())).status,200);
    assert.equal(writes,2);
    state="regular";
    assert.equal((await POST(request())).status,200);
    assert.equal(writes,2);
    state="unsubscribed"; fail=true;
    assert.equal((await POST(request())).status,503);
    delete process.env.BUTTONDOWN_WEBHOOK_SIGNING_KEY;
    assert.equal((await POST(request())).status,503);
  } finally { globalThis.fetch=original; process.env=saved; }
});
