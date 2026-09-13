"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authRpc, cookieHash, cookieOptions, sessionCookie } from "@/lib/admin-auth/server";

export async function logout() {
  await authRpc("logout", { token: await cookieHash(sessionCookie) });
  (await cookies()).set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
  redirect("/admin");
}
