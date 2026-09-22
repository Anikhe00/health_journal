import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // JWT sessions: the login cookie is signed, no session table needed.
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const passwordOk = await bcrypt.compare(password, user.passwordHash);
        if (!passwordOk) return null;

        return { id: user.id, name: user.name, email: user.email, sessionVersion: user.sessionVersion };
      },
    }),
  ],
  callbacks: {
    // Put the user id and the session version in the token, then expose them on session.user.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sv = user.sessionVersion ?? 0;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.sv = token.sv;
      }
      return session;
    },
  },
};

// The signed-in person's full row, straight from the database, or null if no one is signed in.
// Wrapped in React's cache() so a single page load shares one query, however many places ask for it
// (the header, a page's own requireUserId() check, and the page's own display all read the same row).
export const getSessionUser = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
});

// The id of the signed-in person, or null. A login only counts if the account still exists AND the login
// was made with the account's current session version, which is raised by "Sign out on all devices".
// (A login from before versions existed has none, which counts as version 0.)
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await getSessionUser();
  if (!user || (session.user.sv ?? 0) !== user.sessionVersion) return null;
  return session.user.id;
}

// Use at the top of any protected page or server action.
// Sends the visitor to /login if they aren't signed in, otherwise returns their user id.
export async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // A login cookie can outlive its account (deleted) or be cancelled ("Sign out on all devices").
  // That route clears the stale cookie, then goes to /login.
  const userId = await getCurrentUserId();
  if (!userId) redirect("/api/session-expired");
  return userId;
}
