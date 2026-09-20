import { NextResponse } from "next/server";

// Signs out a visitor whose account no longer exists: clears the login cookie, then goes to /login.
// (Without this, the proxy would keep bouncing them between /login and /dashboard.)
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  for (const name of ["next-auth.session-token", "__Secure-next-auth.session-token"]) {
    response.cookies.delete(name);
  }
  return response;
}
