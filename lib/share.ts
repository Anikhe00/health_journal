import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// A new secret for a link: 32 random bytes, far too many to guess. Only its fingerprint is saved.
export function newShareToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashToken(token) };
}

// The share a link belongs to, but only while it works: not turned off, not expired.
export async function findActiveShare(token: string) {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  return prisma.share.findFirst({
    where: { tokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() } },
  });
}
