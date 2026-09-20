"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { readHealthFields } from "@/lib/health-fields";
import { deleteStoredFiles } from "@/lib/storage";

export type ProfileFormState = { error?: string; saved?: boolean } | undefined;

export async function updateProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const userId = await requireUserId();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Please enter your name." };

  const health = readHealthFields(formData);
  if ("error" in health) return { error: health.error };

  await prisma.user.update({ where: { id: userId }, data: { name, ...health.data } });

  revalidatePath("/", "layout"); // the header avatar shows your initial
  return { saved: true };
}

export type DeleteAccountState = { error?: string; deleted?: boolean } | undefined;

// Deletes the whole account, but only if the person types their password again.
// (Something as final as this should need more than an already-open login.)
export async function deleteAccount(_prev: DeleteAccountState, formData: FormData): Promise<DeleteAccountState> {
  const userId = await requireUserId();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "We couldn't find your account." };
  if (!password || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "That password isn't right. Please try again." };
  }

  // Remember which photos to remove from disk, then delete the account.
  // The database deletes everything that belongs to it too: entries, their photos' records, and the passport.
  const attachments = await prisma.attachment.findMany({ where: { entry: { userId } }, select: { id: true } });
  await prisma.user.delete({ where: { id: userId } });
  await deleteStoredFiles(attachments.map((attachment) => attachment.id));

  // The browser signs out next (see DeleteAccountForm).
  return { deleted: true };
}

// Cancels every login of this account, on every device. New logins carry the new number.
export async function signOutEverywhere() {
  const userId = await requireUserId();
  await prisma.user.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } } });
  // The browser signs out next (see SignOutEverywhereButton).
}
