import { type NextRequest, NextResponse } from "next/server";
import { authRpc, sessionCookie } from "@/lib/admin-auth/server";
import { hashToken } from "@/lib/admin-auth/crypto";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const secureHeaders = {
    "Cache-Control": "no-store, private",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (path === "/supremeadmin" || path.startsWith("/api/admin/")) {
    return NextResponse.next({ headers: secureHeaders });
  }

  if (!path.startsWith("/supremeadmin/")) return NextResponse.next();
  const token = request.cookies.get(sessionCookie)?.value;
  try {
    const session = token && /^[A-Za-z0-9_-]{43}$/.test(token) ? await authRpc("session", { token: hashToken(token) }) : null;
    if (session) return NextResponse.next({ headers: secureHeaders });
  } catch {
    return new NextResponse("Admin authentication is temporarily unavailable.", { status: 503, headers: secureHeaders });
  }
  return NextResponse.redirect(new URL("/supremeadmin", request.url), { headers: secureHeaders });
}
export const config = { matcher: ["/supremeadmin/:path*", "/api/admin/:path*"] };
