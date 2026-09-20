"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { publicOrigin } from "@/lib/app-url";
import { requireUserId } from "@/lib/auth";
import { newShareToken } from "@/lib/share";
import { EXPIRY_OPTIONS, MAX_SHARE_ENTRIES } from "@/lib/share-options";

export type CreateShareState = { error?: string; url?: string } | undefined;

// Makes a link that shows the chosen entries to anyone who has it, until it expires or is turned off.
export async function createShare(_prev: CreateShareState, formData: FormData): Promise<CreateShareState> {
  const userId = await requireUserId();

  const entryIds = [...new Set(formData.getAll("entryId").map(String))];
  const label = String(formData.get("label") ?? "").trim();
  const hours = Number(formData.get("hours"));

  if (entryIds.length === 0) return { error: "Please choose at least one entry to share." };
  if (entryIds.length > MAX_SHARE_ENTRIES) return { error: `You can share up to ${MAX_SHARE_ENTRIES} entries in one link.` };
  if (label.length > 80) return { error: "The name for this link is too long. Please keep it under 80 characters." };
  if (!EXPIRY_OPTIONS.some((option) => option.hours === hours)) return { error: "Please choose how long the link should work." };

  // Only your own entries can be shared.
  const owned = await prisma.entry.count({ where: { id: { in: entryIds }, userId } });
  if (owned !== entryIds.length) return { error: "One of those entries couldn't be found. Please try again." };

  const { token, tokenHash } = newShareToken();
  await prisma.share.create({
    data: {
      userId,
      tokenHash,
      label: label || null,
      expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
      entries: { create: entryIds.map((entryId) => ({ entryId })) },
    },
  });

  revalidatePath("/share");
  // This is the only time the full link exists: only its fingerprint is saved.
  return { url: `${publicOrigin()}/share/${token}` };
}

// Turns a link off straight away.
export async function revokeShare(id: string) {
  const userId = await requireUserId();
  await prisma.share.updateMany({ where: { id, userId, revokedAt: null }, data: { revokedAt: new Date() } });
  revalidatePath("/share");
}
