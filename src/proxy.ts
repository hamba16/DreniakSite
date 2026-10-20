import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { authRpc, sessionCookie } from "@/lib/admin-auth/server";
import { hashToken } from "@/lib/admin-auth/crypto";
import { portalCookieName } from "@/lib/portal/constants";
import { recordHomepageRequest } from "@/lib/traffic-guard";

const portalHeaders = {
  "Cache-Control": "no-store, private",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self' data:; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow",
};

function withPortalHeaders(response: NextResponse) {
  for (const [key, value] of Object.entries(portalHeaders))
    response.headers.set(key, value);
  return response;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/") {
    // Count for monitoring only. API abuse limits remain on their respective routes.
    // CDN request quotas count before this hook, so a homepage 429 cannot save quota.
    await recordHomepageRequest();
  }
  const secureHeaders = { "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };
  if (path === "/admin" || path === "/admin/login" || path.startsWith("/api/admin/")) return NextResponse.next({ headers: secureHeaders });
  if (path === "/portal" || path.startsWith("/portal/") || path === "/auth/callback") {
    let response = NextResponse.next({ request: { headers: request.headers } });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (url && key) {
      const supabase = createServerClient(url, key, {
        cookieOptions: {
          name: portalCookieName,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (items) => {
            for (const { name, value } of items) request.cookies.set(name, value);
            response = NextResponse.next({ request: { headers: request.headers } });
            for (const { name, value, options } of items)
              response.cookies.set(name, value, options);
          },
        },
      });
      try {
        await supabase.auth.getUser();
      } catch {
        // Route data access still fails closed; Proxy only refreshes the session.
      }
    }
    return withPortalHeaders(response);
  }
  if (!path.startsWith("/admin/")) return NextResponse.next();
  const token = request.cookies.get(sessionCookie)?.value;
  try {
    const session = token && /^[A-Za-z0-9_-]{43}$/.test(token) ? await authRpc("session", { token: hashToken(token) }) : null;
    if (session) return NextResponse.next({ headers: secureHeaders });
  } catch {
    return new NextResponse("Admin authentication is temporarily unavailable.", { status: 503, headers: secureHeaders });
  }
  return NextResponse.redirect(new URL("/admin", request.url), { headers: secureHeaders });
}
export const config = { matcher: ["/", "/admin/:path*", "/api/admin/:path*", "/portal/:path*", "/auth/callback"] };
