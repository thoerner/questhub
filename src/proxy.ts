import { type NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "authjs.session-token";
const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token";

function hasSessionCookie(req: NextRequest): boolean {
  return (
    req.cookies.has(SESSION_COOKIE) || req.cookies.has(SECURE_SESSION_COOKIE)
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = hasSessionCookie(req);

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
