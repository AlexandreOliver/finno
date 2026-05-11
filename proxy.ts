import { NextResponse, type NextProxy } from "next/server";

export const PRIVATE = ["/dashboard"];
export const PUBLIC = ["/auth", "/api"];

export const proxy: NextProxy = async (request) => {
  const pathname = request.nextUrl.pathname;
  const isPrivateRoute = PRIVATE.some((route) => pathname.startsWith(route));

  const sessionToken = request.cookies.get("session_token");
  const lengthCorrect = sessionToken?.value.length === 96;

  if (isPrivateRoute && (!sessionToken || !lengthCorrect)) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    //"/((?!\.|auth|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)",
    "/((?!$|auth|_next/static|_next/image|.*\\.(?:png|ico)$).*)",
  ],
};
