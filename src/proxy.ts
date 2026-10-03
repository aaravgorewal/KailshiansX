// src/proxy.ts — Next.js 16 Proxy (renamed from middleware.ts)
// Protects /admin/* routes: only ADMIN, SUPER_ADMIN, EVENT_MANAGER may enter.
// All other authenticated-required routes redirect to /signin if no session.
//
// Auth.js v5: we call auth() in proxy — it reads the session cookie directly
// without a DB round-trip (uses JWT-style session verification on the cookie).

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/server/security/rate-limit";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EVENT_MANAGER"] as const;
type AdminRole = (typeof ADMIN_ROLES)[number];

function isAdminRole(role: string | undefined): role is AdminRole {
  return ADMIN_ROLES.includes(role as AdminRole);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. CSRF Protection for API Mutations ────────────────────────────────────
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && pathname.startsWith("/api/")) {
    // Webhooks verify their own cryptographic HMAC signatures
    if (!pathname.startsWith("/api/webhooks/")) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");
      if (origin && host) {
        try {
          const originHost = new URL(origin).host;
          if (
            originHost !== host &&
            !originHost.includes("localhost") &&
            !originHost.includes("127.0.0.1")
          ) {
            return new NextResponse("Cross-origin request forbidden", { status: 403 });
          }
        } catch {
          return new NextResponse("Invalid origin header", { status: 400 });
        }
      }
    }
  }

  // ── 2. Rate Limiting for Authentication ─────────────────────────────────────
  if (pathname.startsWith("/signin") || pathname.startsWith("/api/auth")) {
    const ip = getClientIp(request.headers);
    const rl = await checkRateLimit(ip, "auth");
    if (!rl.success) {
      return new NextResponse("Too many authentication requests. Please try again shortly.", {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }
  }

  // ── 3. Protect /admin/* ─────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const session = await auth();

    // Not signed in → redirect to /signin with callbackUrl
    if (!session?.user) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Signed in but insufficient role → 403 page
    if (!isAdminRole(session.user.role)) {
      const forbiddenUrl = new URL("/auth/error?error=AccessDenied", request.url);
      return NextResponse.redirect(forbiddenUrl);
    }

    // Pass through — add a header so admin layout can trust auth status
    const response = NextResponse.next();
    response.headers.set("x-auth-user-id", session.user.id);
    response.headers.set("x-auth-user-role", session.user.role);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect /admin and all sub-paths
    "/admin/:path*",
    // Skip static files, images, and sitemap — keep proxy lightweight
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|css|js)$).*)",
  ],
};
