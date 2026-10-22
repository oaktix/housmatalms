import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "./lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js paths bypass middleware
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = await getSessionFromRequest(request);

  // -------------------------------------------------------------------------
  // 1. LMS Portal Routes Protection
  // -------------------------------------------------------------------------
  if (pathname.startsWith("/lms")) {
    // Login page: if already logged in with valid session, redirect to destination
    if (pathname === "/lms/login") {
      if (session) {
        if (session.role === "admin") {
          return NextResponse.redirect(new URL("/lms/admin/dashboard", request.url));
        } else if (session.role === "instructor") {
          return NextResponse.redirect(new URL("/lms/instructor/dashboard", request.url));
        } else if (session.role === "student") {
          return NextResponse.redirect(new URL("/lms/student/dashboard", request.url));
        }
      }
      return NextResponse.next();
    }

    // All other /lms routes require a verified session
    if (!session) {
      const loginUrl = new URL("/lms/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-Based Access Control (RBAC)
    const { role } = session;

    if (pathname.startsWith("/lms/admin") && role !== "admin") {
      const target = role === "instructor" ? "/lms/instructor/dashboard" : "/lms/student/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (
      pathname.startsWith("/lms/instructor") &&
      role !== "instructor" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/lms/student/dashboard", request.url));
    }

    if (
      pathname.startsWith("/lms/student") &&
      role !== "student" &&
      role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/lms/instructor/dashboard", request.url));
    }

    // Forward verified session headers to downstream components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-lms-user-id", session.userId);
    requestHeaders.set("x-lms-user-role", session.role);
    requestHeaders.set("x-lms-user-email", session.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // -------------------------------------------------------------------------
  // 2. Database Proxy Gate (/api/db/*)
  // -------------------------------------------------------------------------
  if (pathname.startsWith("/api/db")) {
    const requestHeaders = new Headers(request.headers);
    if (session) {
      requestHeaders.set("x-lms-user-id", session.userId);
      requestHeaders.set("x-lms-user-role", session.role);
      requestHeaders.set("x-lms-user-email", session.email);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/lms/:path*",
    "/api/db/:path*",
  ],
};
