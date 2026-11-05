import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to parse JWT payload without a library (Edge compatible)
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const { pathname } = request.nextUrl;

  // 1. Authentication Check
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Role-based Authorization
    const payload = parseJwt(token);
    const userRole = payload?.role;

    // Restrict /dashboard/users to ADMIN and MANAGER
    if (pathname.startsWith("/dashboard/users")) {
      if (!["ADMIN", "MANAGER"].includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // You can add more role-based restrictions here
  }

  // Auth routes (redirect to dashboard if already logged in)
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
