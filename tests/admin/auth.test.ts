import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { codeAt, decryptSecret, encryptSecret, hashToken, newSecret, newToken, setupUri, verifyCode } from "../../src/lib/admin-auth/crypto";
import { rpc, testDatabase } from "./database";

test("RFC 6238 SHA1 vectors, six digits, drift window and input rejection", () => {
  const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
  for (const [seconds, code] of [[59, "287082"], [1111111109, "081804"], [1111111111, "050471"], [1234567890, "005924"], [2000000000, "279037"], [20000000000, "353130"]] as const) {
    assert.equal(codeAt(secret, Math.floor(seconds / 30)), code);
    assert.equal(verifyCode(secret, code, seconds * 1000), Math.floor(seconds / 30));
  }
  assert.equal(verifyCode(secret, codeAt(secret, 100), 101 * 30000), 100);
  assert.equal(verifyCode(secret, codeAt(secret, 100), 102 * 30000), null);
  for (const invalid of ["", "12345", "1234567", "12345x", " 287082", "１２３４５６"]) assert.equal(verifyCode(secret, invalid), null);
});

test("unique secrets, authenticated encryption, tampering and key binding", () => {
  process.env.ADMIN_TOTP_MASTER_KEY = randomBytes(32).toString("base64");
  const secrets = [newSecret(), newSecret(), newSecret()];
  assert.equal(new Set(secrets).size, 3);
  assert.ok(secrets.every((s) => /^[A-Z2-7]{32}$/.test(s)));
  const id = randomUUID(), secret = secrets[0];
  const encrypted = encryptSecret(secret, id);
  assert.ok(!encrypted.includes(secret));
  assert.notEqual(encrypted, encryptSecret(secret, id));
  assert.equal(decryptSecret(encrypted, id), secret);
  assert.throws(() => decryptSecret(encrypted, randomUUID()));
  const parts = encrypted.split("."); parts[3] = "AAAA";
  assert.throws(() => decryptSecret(parts.join("."), id));
  process.env.ADMIN_TOTP_MASTER_KEY = randomBytes(32).toString("base64");
  assert.throws(() => decryptSecret(encrypted, id));
  delete process.env.ADMIN_TOTP_MASTER_KEY;
  assert.throws(() => encryptSecret(secret, id));
  const uri = new URL(setupUri(secret, "Remote iPhone"));
  assert.equal(uri.protocol, "otpauth:"); assert.equal(uri.searchParams.get("digits"), "6");
  assert.equal(uri.searchParams.get("period"), "30"); assert.equal(uri.searchParams.get("algorithm"), "SHA1");
  assert.match(newToken(), /^[A-Za-z0-9_-]{43}$/); assert.equal(hashToken(newToken()).length, 64);
});

test("database lifecycle, hard capacity, replay, expiry, revocation and privileges", async () => {
  const db = await testDatabase();
  try {
    assert.deepEqual(await rpc(db, "status"), { count: 0 });
    const ids = Array.from({ length: 5 }, () => randomUUID());
    for (let i = 0; i < 5; i++) await rpc(db, "begin", { id: ids[i], token: `pending${i}`, label: `Device ${i}`, secret: `encrypted${i}` });
    assert.deepEqual(await rpc(db, "status"), { count: 0 });
    await db.exec("update public.admin_enrollments set expires_at = now() - interval '1 second' where token_hash = 'pending4'");
    assert.equal(await rpc(db, "pending", { token: "pending4" }), null);
    const results = await Promise.all(ids.slice(0, 4).map((_, i) => rpc<{ error?: string }>(db, "confirm", { token: `pending${i}`, step: 100 })));
    assert.equal(results.filter((r) => !r.error).length, 3);
    assert.deepEqual(await rpc(db, "status"), { count: 3 });
    assert.ok((await rpc<{ error: string }>(db, "begin", { id: ids[4], token: "another", label: "Fourth", secret: "encrypted" })).error);
    await assert.rejects(db.query("insert into public.admin_authenticators values ($1, 4, 'Fourth', 'encrypted', 1, now())", [ids[4]]));
    await assert.rejects(db.query("insert into public.admin_authenticators values ($1, 1, 'Duplicate', 'encrypted', 1, now())", [ids[4]]));
    assert.ok((await rpc<{ error: string }>(db, "login", { id: ids[0], step: 100, token: "session" })).error);
    const logins = await Promise.all(["sessionA", "sessionB"].map((token) => rpc<{ error?: string }>(db, "login", { id: ids[0], step: 101, token })));
    assert.equal(logins.filter((r) => !r.error).length, 1);
    await rpc(db, "login", { id: ids[1], step: 101, token: "session2" });
    await rpc(db, "login", { id: ids[2], step: 101, token: "session3" });
    const list = await rpc<object[]>(db, "list", { token: "sessionA" });
    assert.ok(list.every((item) => Object.keys(item).sort().join() === "id,label"));
    assert.ok((await rpc<{ error: string }>(db, "revoke", { token: "fake", id: ids[1] })).error);
    await rpc(db, "revoke", { token: "sessionA", id: ids[1] });
    assert.equal(await rpc(db, "session", { token: "session2" }), null);
    assert.ok((await rpc<{ error: string }>(db, "login", { id: ids[1], step: 102, token: "revoked" })).error);
    assert.deepEqual(await rpc(db, "status"), { count: 2 });
    await rpc(db, "begin", { id: ids[4], token: "replacement", label: "Replacement", secret: "encrypted5" });
    assert.deepEqual(await rpc(db, "confirm", { token: "replacement", step: 102 }), {});
    await rpc(db, "revoke", { token: "sessionA", id: ids[4] });
    const revocations = await Promise.all([ids[2], ids[0]].map((id) => rpc<{ error?: string }>(db, "revoke", { token: "sessionA", id })));
    assert.equal(revocations.filter((r) => !r.error).length, 1, "Concurrent revocation cannot remove both remaining authenticators");
    assert.ok((await rpc<{ error: string }>(db, "revoke", { token: "sessionA", id: ids[0] })).error);
    await assert.rejects(db.exec("delete from public.admin_authenticators"));
    await rpc(db, "logout", { token: "sessionA" });
    assert.equal(await rpc(db, "session", { token: "sessionA" }), null);
    await rpc(db, "login", { id: ids[0], step: 103, token: "expired" });
    await db.exec("update public.admin_sessions set expires_at = now() - interval '1 second'");
    assert.equal(await rpc(db, "session", { token: "expired" }), null);
    assert.equal(await rpc(db, "limit", { key: "test", max: 1, seconds: 300 }), true);
    assert.equal(await rpc(db, "limit", { key: "test", max: 1, seconds: 300 }), false);
    await db.exec("update public.admin_auth_limits set expires_at = now() - interval '1 second'");
    assert.equal(await rpc(db, "limit", { key: "test", max: 1, seconds: 300 }), true);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await assert.rejects(rpc(db, "candidates"));
      await assert.rejects(db.query("select * from public.admin_authenticators"));
      await assert.rejects(db.query("insert into public.services(name) values ('unauthorized')"));
      await db.exec("reset role");
    }
    await db.exec("set role service_role");
    assert.deepEqual(await rpc(db, "status"), { count: 1 });
    await db.exec("reset role");
    const policies = await db.query("select * from pg_policies where policyname like 'admins have full access%'");
    assert.equal(policies.rows.length, 0);
    assert.equal((await db.query<{ is_admin: boolean }>("select public.is_admin()")).rows[0].is_admin, false);
  } finally { await db.close(); }
});
