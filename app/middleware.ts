import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const { pathname } = request.nextUrl;

  // ✅ Bỏ qua tất cả API
  // if (pathname.startsWith("/api")) {
  //   return NextResponse.next();
  // }

  const authRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password"];

  if (authRoutes.some((route) => pathname.startsWith(route)) && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/api/:path*"],
};
