/**
 * Next.js Edge Middleware
 *
 * Responsibilities:
 *  1. Session validation — redirect unauthenticated users to /login
 *  2. Role-Based Access Control (RBAC) — enforce route-level permissions
 *  3. mustChangePassword gate — redirect flagged users to /change-password
 *     before allowing any dashboard access
 *
 * Edge runtime safe: Does not import Prisma or server-only cryptos directly.
 * Validates session cookie and calls internal auth endpoint when token exists.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// Route Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PUBLIC_ROUTES = ["/login", "/register", "/api/auth"];

const ROLE_ROUTES: Record<string, string> = {
  "/admin": "ADMIN",
  "/teacher": "TEACHER",
  "/student": "STUDENT",
};

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/") || pathname.startsWith(route + "?")
  );
}

function getRequiredRole(pathname: string): string | null {
  for (const [prefix, role] of Object.entries(ROLE_ROUTES)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return role;
    }
  }
  return null;
}

function getDashboardPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    default:
      return "/login";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, static files, and APIs (APIs handle their own session guard)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie presence
  const sessionCookie =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  // 1. Unauthenticated user
  if (!sessionCookie) {
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user: retrieve role & profile from internal /api/auth/me
  try {
    const authUrl = new URL("/api/auth/me", request.url);
    const meRes = await fetch(authUrl.toString(), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (!meRes.ok) {
      // Session cookie is invalid or expired
      if (isPublicRoute(pathname)) {
        return NextResponse.next();
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const user = await meRes.json();

    // If already on public page (login/register), redirect to dashboard
    if (isPublicRoute(pathname)) {
      const dashboardPath = getDashboardPath(user.role || "");
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // mustChangePassword gate
    if (user.mustChangePassword && pathname !== "/change-password") {
      return NextResponse.redirect(new URL("/change-password", request.url));
    }

    // RBAC route enforcement
    const isSharedRoute =
      pathname.startsWith("/admin/sections") || pathname.startsWith("/admin/subjects");

    if (isSharedRoute && (user.role === "ADMIN" || user.role === "TEACHER")) {
      // Allowed for both ADMIN and TEACHER
    } else {
      const requiredRole = getRequiredRole(pathname);
      if (requiredRole && user.role !== requiredRole) {
        const dashboardPath = getDashboardPath(user.role || "");
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    }

    // Root path redirect
    if (pathname === "/") {
      if (user.mustChangePassword) {
        return NextResponse.redirect(new URL("/change-password", request.url));
      }
      const dashboardPath = getDashboardPath(user.role || "");
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware auth verification error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
