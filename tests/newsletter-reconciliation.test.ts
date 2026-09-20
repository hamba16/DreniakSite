import { test } from "node:test";
import assert from "node:assert/strict";
import { reconcileSubscribers } from "../src/lib/newsletter-reconciliation";
test("reconciliation retries captured subscribers without lifting suppression", async () => {
  const previous = process.env.BUTTONDOWN_API_KEY;
  const original = globalThis.fetch;
  process.env.BUTTONDOWN_API_KEY = "test";
  let count = 0;
  globalThis.fetch = async (_, init) => {
    count++;
    assert.equal(init?.method, "POST");
    assert.equal(new Headers(init?.headers).get("X-Buttondown-Collision-Behavior"), "add");
    assert.equal(JSON.parse(String(init?.body)).type, undefined);
    return count === 1 ? Response.json({code:"subscriber_exists"},{status:400}) : Response.json({code:"subscriber_suppressed"},{status:400});
  };
  try { assert.deepEqual(await reconcileSubscribers(["a@example.com","b@example.com"]), {checked:2,failed:1}); }
  finally { globalThis.fetch=original; if(previous===undefined) delete process.env.BUTTONDOWN_API_KEY; else process.env.BUTTONDOWN_API_KEY=previous; }
});
