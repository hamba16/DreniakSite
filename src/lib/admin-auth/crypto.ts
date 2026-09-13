import "server-only";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function newSecret() {
  const bytes = randomBytes(20);
  let bits = "";
  for (const byte of bytes) bits += byte.toString(2).padStart(8, "0");
  return bits.match(/.{5}/g)!.map((part) => alphabet[parseInt(part, 2)]).join("");
}
export function codeAt(secret: string, step: number) {
  const bits = [...secret].map((c) => {
    const index = alphabet.indexOf(c);
    if (index < 0) throw new Error("Invalid secret.");
    return index.toString(2).padStart(5, "0");
  }).join("");
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const digest = createHmac("sha1", key).update(counter).digest();
  const offset = digest[digest.length - 1] & 15;
  return ((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).toString().padStart(6, "0");
}
export function verifyCode(secret: string, code: string, now = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const current = Math.floor(now / 30_000);
  for (const step of [current, current - 1, current + 1]) {
    if (step >= 0 && timingSafeEqual(Buffer.from(codeAt(secret, step)), Buffer.from(code))) return step;
  }
  return null;
}
function masterKey() {
  const value = process.env.ADMIN_TOTP_MASTER_KEY || "";
  if (!/^[A-Za-z0-9+/]{43}=$/.test(value)) throw new Error("Admin authentication is not configured.");
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("Admin authentication is not configured.");
  return key;
}
export function encryptSecret(secret: string, id: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", masterKey(), iv);
  cipher.setAAD(Buffer.from(`dreniak-totp:v1:${id}`));
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64"), cipher.getAuthTag().toString("base64"), encrypted.toString("base64")].join(".");
}
export function decryptSecret(envelope: string, id: string) {
  const [version, iv, tag, body] = envelope.split(".");
  if (version !== "v1" || !iv || !tag || !body) throw new Error("Invalid encrypted secret.");
  const decipher = createDecipheriv("aes-256-gcm", masterKey(), Buffer.from(iv, "base64"));
  decipher.setAAD(Buffer.from(`dreniak-totp:v1:${id}`));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(body, "base64")), decipher.final()]).toString("utf8");
}
export const newToken = () => randomBytes(32).toString("base64url");
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export function setupUri(secret: string, label: string) {
  return `otpauth://totp/${encodeURIComponent(`Dreniak:${label}`)}?${new URLSearchParams({ secret, issuer: "Dreniak", algorithm: "SHA1", digits: "6", period: "30" })}`;
}
