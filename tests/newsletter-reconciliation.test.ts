import { test } from "node:test";
import assert from "node:assert/strict";
import { reconcileSubscribers } from "../src/lib/newsletter-reconciliation";
test("reconciliation retries captured subscribers without lifting suppression", async () => {
  const previous = process.env.BUTTONDOWN_API_KEY;
  const original = globalThis.fetch;
  process.env.BUTTONDOWN_API_KEY = "test";
  let count = 0;
  const sources = ["dreniak-website", "insights-after-the-connection"];
  globalThis.fetch = async (_, init) => {
    const requestIndex = count++;
    assert.equal(init?.method, "POST");
    assert.equal(new Headers(init?.headers).get("X-Buttondown-Collision-Behavior"), "add");
    const body = JSON.parse(String(init?.body));
    assert.equal(body.type, undefined);
    assert.equal(body.metadata.source, sources[requestIndex]);
    return requestIndex === 0 ? Response.json({code:"subscriber_exists"},{status:400}) : Response.json({code:"subscriber_suppressed"},{status:400});
  };
  try { assert.deepEqual(await reconcileSubscribers([{email:"a@example.com",source:"dreniak-website"},{email:"b@example.com",source:"insights-after-the-connection"}]), {checked:2,failed:1,metadataUnavailable:1}); }
  finally { globalThis.fetch=original; if(previous===undefined) delete process.env.BUTTONDOWN_API_KEY; else process.env.BUTTONDOWN_API_KEY=previous; }
});
