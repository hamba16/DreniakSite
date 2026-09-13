import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { hashToken } from "./crypto";

export function adminDatabase() {
  // Read server configuration at runtime, including when a build is promoted.
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } = process.env;
  if (!url || !key) throw new Error("Admin authentication is not configured.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
export class AuthError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export async function authRpc<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
  const { data: result, error } = await adminDatabase().rpc("admin_auth", { p_action: action, p_data: data });
  if (error) throw new Error("Admin authentication storage is unavailable.");
  if (result && typeof result === "object" && !Array.isArray(result) && "error" in result) throw new AuthError(result.error);
  return result as T;
}
export const sessionCookie = process.env.NODE_ENV === "production" ? "__Host-dreniak_admin" : "dreniak_admin";
export const enrollmentCookie = process.env.NODE_ENV === "production" ? "__Host-dreniak_enrollment" : "dreniak_enrollment";
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
export async function cookieHash(name: string) {
  const token = (await cookies()).get(name)?.value;
  return token && /^[A-Za-z0-9_-]{43}$/.test(token) ? hashToken(token) : "";
}
export async function adminSession() {
  const token = await cookieHash(sessionCookie);
  if (!token) return null;
  return authRpc<{ id: string; label: string } | null>("session", { token });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // Never accept a missing Origin on cookie-authenticated mutations.
  if (!origin || origin !== new URL(request.url).origin) throw new AuthError("Invalid request origin.", 403);
}
export async function authLimit(request: Request, category: string, max = 5, seconds = 300) {
  // On Vercel this header is overwritten by the platform. Other hosts must
  // explicitly opt in to a trusted reverse proxy; fallback shares one bucket.
  const ip = process.env.VERCEL === "1"
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : process.env.TRUST_PROXY === "true"
      ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown" : "shared";
  const allowed = await authRpc<boolean>("limit", { key: `${category}:${hashToken(ip)}`, max, seconds });
  if (!allowed) throw new AuthError("Too many attempts. Please try again later.", 429);
}
