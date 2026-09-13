// Isolated test infrastructure only. Nothing here is imported by the application.
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { testDatabase, rpc } from "./database";

const origin = "http://localhost:3100";
function otp(secret: string, offset = 0) {
  const bits = [...secret].map((c) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c).toString(2).padStart(5, "0")).join("");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000) + offset));
  const digest = createHmac("sha1", key).update(counter).digest();
  return ((digest.readUInt32BE(digest[19] & 15) & 0x7fffffff) % 1_000_000).toString().padStart(6, "0");
}
function decodeQR(data: string) {
  const png = PNG.sync.read(Buffer.from(data.split(",")[1], "base64"));
  const qr = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  assert.ok(qr, "QR must be independently decodable");
  const uri = new URL(qr.data);
  assert.equal(uri.protocol, "otpauth:"); assert.equal(uri.searchParams.get("issuer"), "Dreniak");
  assert.equal(uri.searchParams.get("digits"), "6"); assert.equal(uri.searchParams.get("period"), "30");
  return uri.searchParams.get("secret")!;
}
async function main() {
  const db = await testDatabase();
  await db.exec("set role service_role");
  const credential = randomBytes(32).toString("hex");
  let storageAvailable = true;
  // A deliberately tiny PostgREST adapter executing the real PL/pgSQL function.
  // It validates the server credential; it never implements auth decisions.
  const adapter = createServer(async (req, res) => {
    try {
      if (!storageAvailable) { res.writeHead(503).end(); return; }
      if (req.headers.apikey !== credential) { res.writeHead(403).end(); return; }
      let raw = ""; for await (const chunk of req) raw += chunk;
      const path = new URL(req.url!, "http://localhost").pathname;
      let result: unknown;
      if (path === "/rest/v1/rpc/admin_auth") {
        const { p_action, p_data } = JSON.parse(raw);
        result = await rpc(db, p_action, p_data);
      } else if (path === "/rest/v1/services") {
        if (req.method === "POST") {
          const value = JSON.parse(raw);
          result = (await db.query("insert into public.services(name, description) values ($1, $2) returning *", [value.name, value.description])).rows[0];
        } else result = (await db.query("select * from public.services")).rows;
      } else { res.writeHead(404).end(); return; }
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(result));
    } catch { res.writeHead(500, { "Content-Type": "application/json" }).end(JSON.stringify({ message: "Test database error" })); }
  });
  await new Promise<void>((resolve) => adapter.listen(54329, "127.0.0.1", resolve));
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", "3100"], {
    env: { ...process.env, NODE_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329", SUPABASE_SERVICE_ROLE_KEY: credential, ADMIN_TOTP_MASTER_KEY: randomBytes(32).toString("base64"), TRUST_PROXY: "true", NEXT_PUBLIC_GA_ID: "" },
    stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
  });
  let serverOutput = "";
  child.stdout.on("data", (chunk) => { serverOutput += String(chunk); });
  child.stderr.on("data", (chunk) => { serverOutput += String(chunk); });
  let browser: Browser | undefined;
  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try { if ((await fetch(`${origin}/admin`)).ok) { ready = true; break; } } catch { /* starting */ }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    assert.ok(ready, `Next did not start: ${serverOutput}`);
    console.log("Isolated Next.js admin server ready at http://localhost:3100/admin");
    if (process.argv.includes("--serve")) {
      await new Promise<void>((resolve) => { process.once("SIGINT", resolve); process.once("SIGTERM", resolve); });
      return;
    }
    browser = await chromium.launch({ headless: true });
    const contexts: BrowserContext[] = [];
    async function context(ip: number) {
      const ctx = await browser!.newContext({ baseURL: origin, extraHTTPHeaders: { "x-forwarded-for": `127.0.0.${ip}` } });
      contexts.push(ctx); return ctx;
    }
    const visitors = await Promise.all([1, 2, 3, 4, 5].map(context));
    const pages = await Promise.all(visitors.map((ctx) => ctx.newPage()));
    const errors: string[] = [];
    pages.forEach((page) => page.on("pageerror", (error) => errors.push(error.message)));
    async function post(ctx: BrowserContext, action: string, body: object, requestOrigin = origin) {
      return ctx.request.post(`${origin}/api/admin/auth/${action}`, { headers: { origin: requestOrigin }, data: body });
    }
    async function enroll(page: Page, label: string) {
      await page.goto(`${origin}/admin`);
      await page.getByRole("button", { name: "Register authenticator", exact: true }).click();
      await page.getByLabel("Authenticator label").fill(label);
      await page.getByRole("button", { name: "Generate QR code" }).click();
      const image = page.getByAltText("Scan to register this authenticator");
      await expect(image).toBeVisible();
      const secret = decodeQR((await image.getAttribute("src"))!);
      await page.getByLabel("Six-digit code").fill(otp(secret));
      await page.getByRole("button", { name: "Confirm authenticator" }).click();
      await expect(page.getByRole("status")).toContainText("Authenticator registered");
      return secret;
    }
    await pages[0].goto(`${origin}/admin/services`);
    await expect(pages[0]).toHaveURL(`${origin}/admin`);
    assert.equal((await visitors[0].request.get(`${origin}/api/admin/services`)).status(), 403);
    for (const [route, method] of [["/api/admin/services", "POST"], ["/api/admin/media/upload", "POST"], ["/api/admin/media/delete", "DELETE"]]) {
      assert.equal((await visitors[0].request.fetch(`${origin}${route}`, { method, headers: { origin }, data: {} })).status(), 403);
    }
    assert.equal((await post(visitors[0], "begin", { label: "CSRF" }, "https://evil.example")).status(), 403);
    assert.equal((await visitors[0].request.post(`${origin}/api/admin/auth/begin`, { data: { label: "No origin" } })).status(), 403);
    assert.equal((await post(visitors[0], "confirm", { code: "000000" })).status(), 400);
    const a = await enroll(pages[0], "Primary iPhone");
    assert.equal((await post(visitors[0], "login", { code: otp(a) })).status(), 401, "Enrollment code is already consumed");
    await pages[0].getByLabel("Six-digit code").fill(otp(a, 1));
    await pages[0].getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(pages[0].getByRole("heading", { name: "Content dashboard" })).toBeVisible();
    const session = (await visitors[0].cookies()).find((cookie) => cookie.name === "__Host-dreniak_admin");
    assert.ok(session?.httpOnly && session.secure && session.sameSite === "Strict");
    assert.ok(!(await pages[0].evaluate(() => document.cookie)).includes("dreniak_admin"));
    const saved = await visitors[0].request.post(`${origin}/api/admin/services`, { headers: { origin }, data: { division: null, name: "Lifecycle test", description: "Preserved CMS contract", includes: [], value: "", editorial_status: "published", sort_order: 0 } });
    assert.equal(saved.status(), 201);
    assert.equal((await db.query("select name from public.services")).rows.length, 1);
    await pages[0].goto(`${origin}/admin/authenticators`);
    await expect(pages[0].getByRole("button", { name: "Revoke" })).toBeDisabled();
    const b = await enroll(pages[1], "Remote Mac");
    const setupC = await post(visitors[2], "begin", { label: "Third phone" });
    const setupD = await post(visitors[3], "begin", { label: "Competing phone" });
    const c = decodeQR((await setupC.json()).qr), d = decodeQR((await setupD.json()).qr);
    assert.equal(new Set([a, b, c, d]).size, 4);
    // Pending setup from a different browser cannot be confirmed.
    assert.equal((await post(visitors[4], "confirm", { code: otp(c) })).status(), 400);
    const race = await Promise.all([post(visitors[2], "confirm", { code: otp(c) }), post(visitors[3], "confirm", { code: otp(d) })]);
    assert.equal(race.filter((r) => r.status() === 200).length, 1);
    assert.deepEqual(await rpc(db, "status"), { count: 3 });
    await pages[4].goto(`${origin}/admin`);
    await expect(pages[4].getByRole("button", { name: "Register authenticator" })).toHaveCount(0);
    assert.equal((await post(visitors[4], "begin", { label: "Fourth" })).status(), 400);
    assert.equal((await post(visitors[1], "login", { code: otp(b, 1) })).status(), 200);
    const winner = race[0].status() === 200 ? { ctx: visitors[2], secret: c } : { ctx: visitors[3], secret: d };
    assert.equal((await post(winner.ctx, "login", { code: otp(winner.secret, 1) })).status(), 200, "Any one of three authenticators logs in");
    await pages[0].reload();
    await expect(pages[0].getByText("Remote Mac", { exact: true })).toBeVisible();
    const html = await pages[0].content();
    for (const secret of [a, b, c, d]) assert.ok(!html.includes(secret));
    const before = await db.query<{ id: string }>("select id from public.admin_authenticators where label = 'Remote Mac'");
    const stolenSession = (await visitors[1].cookies()).find((cookie) => cookie.name === "__Host-dreniak_admin")!;
    pages[0].once("dialog", (dialog) => dialog.accept());
    await pages[0].locator("article").filter({ hasText: "Remote Mac" }).getByRole("button", { name: "Revoke" }).click();
    await expect(pages[0].getByRole("status")).toContainText("revoked");
    assert.equal((await visitors[1].request.get(`${origin}/api/admin/services`)).status(), 403);
    assert.equal((await post(visitors[1], "login", { code: otp(b) })).status(), 401);
    assert.equal((await db.query("select * from public.admin_sessions where authenticator_id = $1", [before.rows[0].id])).rows.length, 0);
    await pages[4].reload();
    await expect(pages[4].getByRole("button", { name: "Register authenticator" })).toBeVisible();
    const replacement = await enroll(pages[4], "Replacement iPad");
    assert.notEqual(replacement, b);
    assert.deepEqual(await rpc(db, "status"), { count: 3 });
    await visitors[1].addCookies([stolenSession]);
    await pages[1].goto(`${origin}/admin/authenticators`);
    await expect(pages[1]).toHaveURL(`${origin}/admin`);
    const replayContext = await context(20);
    assert.equal((await post(replayContext, "login", { code: otp(a, 1) })).status(), 401);
    const badContext = await context(21);
    for (let i = 0; i < 5; i++) assert.equal((await post(badContext, "login", { code: "abcdef" })).status(), 400);
    assert.equal((await post(badContext, "login", { code: "abcdef" })).status(), 429);
    // Self revocation drops the session and reopens enrollment.
    assert.equal((await post(visitors[4], "login", { code: otp(replacement, 1) })).status(), 200);
    const replacementId = (await db.query<{ id: string }>("select id from public.admin_authenticators where label = 'Replacement iPad'")).rows[0].id;
    const selfRevoke = await post(visitors[4], "revoke", { id: replacementId });
    assert.equal((await selfRevoke.json()).signedOut, true);
    assert.equal((await visitors[4].request.get(`${origin}/api/admin/services`)).status(), 403);
    // Logout invalidates the database token, including a copied cookie.
    const copied = (await visitors[0].cookies()).find((cookie) => cookie.name === "__Host-dreniak_admin")!;
    await pages[0].getByRole("button", { name: "Log out", exact: true }).click();
    await expect(pages[0].getByRole("heading", { name: "Sign in" })).toBeVisible();
    await visitors[0].addCookies([copied]);
    assert.equal((await visitors[0].request.get(`${origin}/api/admin/services`)).status(), 403);
    await pages[0].reload();
    await mkdir("test-results", { recursive: true });
    await pages[0].screenshot({ path: "test-results/admin-login-desktop.png" });
    await pages[0].setViewportSize({ width: 375, height: 812 });
    await pages[0].screenshot({ path: "test-results/admin-login-mobile.png" });
    assert.ok(await pages[0].evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    assert.deepEqual(errors, []);
    storageAvailable = false;
    assert.equal((await visitors[0].request.get(`${origin}/admin/services`)).status(), 503);
    assert.equal((await visitors[0].request.get(`${origin}/api/admin/services`)).status(), 403);
    assert.equal((await post(visitors[4], "begin", { label: "Unavailable storage" })).status(), 503);
    console.log("PASS: browser enrollment + QR decoding, independent secrets, three-slot race, OTP replay, all-factor login, secure cookies, CMS write, origin checks, rate limiting, revocation + session invalidation, replacement, self-revocation, logout, desktop/mobile UI.");
  } finally {
    await browser?.close(); child.kill();
    await new Promise<void>((resolve) => adapter.close(() => resolve()));
    await db.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
