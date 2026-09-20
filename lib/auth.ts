import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
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

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    // Put the user id in the token, then expose it on session.user.id.
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};

// Use at the top of any protected page or server action.
// Sends the visitor to /login if they aren't signed in, otherwise returns their user id.
export async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  // A login cookie can outlive the account (for example, it was deleted on another device).
  // That route clears the stale cookie, then goes to /login.
  const accountExists = (await prisma.user.count({ where: { id: session.user.id } })) > 0;
  if (!accountExists) redirect("/api/session-expired");

  return session.user.id;
}
