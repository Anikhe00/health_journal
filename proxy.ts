import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// First line of defence: send signed-out visitors to /login and signed-in visitors
// away from /login and /signup. Pages and server actions also check the session
// themselves (see requireUserId in lib/auth.ts), so this is not the only guard.
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/entries/:path*", "/profile/:path*", "/passport/:path*", "/share", "/login", "/signup"],
};
