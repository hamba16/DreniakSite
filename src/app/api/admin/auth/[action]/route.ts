import { randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { decryptSecret, encryptSecret, hashToken, newSecret, newToken, setupUri, verifyCode } from "@/lib/admin-auth/crypto";
import { AuthError, adminSession, authLimit, authRpc, cookieHash, cookieOptions, enrollmentCookie, sameOrigin, sessionCookie } from "@/lib/admin-auth/server";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer" };
type Factor = { id: string; label: string; encrypted_secret: string };
const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  try {
    sameOrigin(request);
    const { action } = await params;
    if (!["begin", "confirm", "login", "revoke", "logout"].includes(action)) return NextResponse.json({}, { status: 404, headers });
    await authLimit(request, action, action === "logout" ? 30 : 5);
    const jar = await cookies();
    if (action === "logout") {
      await authRpc("logout", { token: await cookieHash(sessionCookie) });
      jar.set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
      return NextResponse.json({ ok: true }, { headers });
    }
    if (Number(request.headers.get("content-length") || 0) > 2048) throw new AuthError("Request too large.", 413);
    const reader = request.body?.getReader();
    let raw = "";
    if (reader) {
      const decoder = new TextDecoder();
      let size = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2048) { await reader.cancel(); throw new AuthError("Request too large.", 413); }
        raw += decoder.decode(value, { stream: true });
      }
      raw += decoder.decode();
    }
    let body: unknown;
    try { body = JSON.parse(raw); } catch { throw new AuthError("Invalid request."); }
    if (action === "begin") {
      const { label } = z.object({ label: z.string().trim().min(1).max(60).regex(/^[^\p{Cc}\p{Cf}]+$/u) }).parse(body);
      // Bound total pending storage and distributed enrollment abuse as well.
      if (!await authRpc<boolean>("limit", { key: "begin:global", max: 100, seconds: 600 })) throw new AuthError("Too many setups. Please try again later.", 429);
      const id = randomUUID(), token = newToken(), secret = newSecret();
      const qr = await QRCode.toDataURL(setupUri(secret, label), { width: 320, margin: 4, errorCorrectionLevel: "M" });
      await authRpc("begin", { id, label, secret: encryptSecret(secret, id), token: hashToken(token), previous: await cookieHash(enrollmentCookie) });
      jar.set(enrollmentCookie, token, { ...cookieOptions, maxAge: 600 });
      return NextResponse.json({ qr }, { headers });
    }
    if (action === "confirm") {
      const { code } = codeSchema.parse(body);
      const token = await cookieHash(enrollmentCookie);
      if (!token) throw new AuthError("Enrollment expired. Start again.");
      if (!await authRpc<boolean>("limit", { key: `confirm:${token}`, max: 5, seconds: 600 })) throw new AuthError("Too many attempts. Start a new setup.", 429);
      const pending = await authRpc<Factor | null>("pending", { token });
      if (!pending) throw new AuthError("Enrollment expired. Start again.");
      const step = verifyCode(decryptSecret(pending.encrypted_secret, pending.id), code);
      if (step === null) throw new AuthError("Invalid code.");
      await authRpc("confirm", { token, step });
      jar.set(enrollmentCookie, "", { ...cookieOptions, maxAge: 0 });
      return NextResponse.json({ ok: true }, { headers });
    }
    if (action === "login") {
      const { code } = codeSchema.parse(body);
      if (!await authRpc<boolean>("limit", { key: "login:global", max: 30, seconds: 300 })) throw new AuthError("Too many attempts. Please try again later.", 429);
      const factors = await authRpc<Factor[]>("candidates");
      const matches = factors.map((factor) => ({ factor, step: verifyCode(decryptSecret(factor.encrypted_secret, factor.id), code) })).filter((m) => m.step !== null);
      if (!matches.length) throw new AuthError("Invalid or already used code.", 401);
      const token = newToken();
      // In the rare case that two authenticators have the same six-digit code,
      // let an unused matching authenticator succeed.
      let accepted = false;
      for (const match of matches) {
        try {
          await authRpc("login", { id: match.factor.id, step: match.step, token: hashToken(token), previous: await cookieHash(sessionCookie) });
          accepted = true; break;
        } catch (error) { if (!(error instanceof AuthError)) throw error; }
      }
      if (!accepted) throw new AuthError("Invalid or already used code.", 401);
      jar.set(sessionCookie, token, { ...cookieOptions, maxAge: 8 * 60 * 60 });
      return NextResponse.json({ ok: true }, { headers });
    }
    const session = await adminSession();
    if (!session) throw new AuthError("Authentication required.", 401);
    const { id } = z.object({ id: z.string().uuid() }).parse(body);
    await authRpc("revoke", { id, token: await cookieHash(sessionCookie) });
    if (id === session.id) jar.set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
    return NextResponse.json({ ok: true, signedOut: id === session.id }, { headers });
  } catch (error) {
    const status = error instanceof AuthError ? error.status : error instanceof z.ZodError ? 400 : 503;
    const message = error instanceof AuthError ? error.message : status === 400 ? "Enter a valid label or six-digit code." : "Admin authentication is unavailable. Please try again later.";
    return NextResponse.json({ error: message }, { status, headers });
  }
}
