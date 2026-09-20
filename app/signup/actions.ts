"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export type SignupResult = { ok: true } | { ok: false; error: string };

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SignupResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (password.length < 8) return { ok: false, error: "Your password must be at least 8 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "An account with this email already exists. Try logging in." };

  // Only the bcrypt hash is stored, never the password itself.
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });

  return { ok: true };
}
