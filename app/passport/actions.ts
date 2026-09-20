"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { readHealthFields } from "@/lib/health-fields";
import { MAX_PASSPORT_TEXT, SEXES } from "@/lib/passport";

export type PassportFormState = { error?: string; saved?: boolean } | undefined;

export async function savePassport(_prev: PassportFormState, formData: FormData): Promise<PassportFormState> {
  const userId = await requireUserId();

  const sex = String(formData.get("sex") ?? "");
  const allergies = String(formData.get("allergies") ?? "").trim();
  const chronicConditions = String(formData.get("chronicConditions") ?? "").trim();
  const currentMedications = String(formData.get("currentMedications") ?? "").trim();

  if (!(SEXES as readonly string[]).includes(sex)) return { error: "Please choose male, female or other." };
  for (const [label, value] of [["Allergies", allergies], ["Conditions", chronicConditions], ["Medications", currentMedications]]) {
    if (value.length > MAX_PASSPORT_TEXT) {
      return { error: `${label} is too long. Please keep it under ${MAX_PASSPORT_TEXT} characters so the QR code stays easy to scan.` };
    }
  }

  // Date of birth, blood group, genotype and emergency contact are the same details as on the profile,
  // so they are saved there, in the same step as the passport details.
  const health = readHealthFields(formData);
  if ("error" in health) return { error: health.error };
  if (!health.data.dateOfBirth) return { error: "Please enter your date of birth." };

  const details = {
    sex,
    allergies: allergies || null,
    chronicConditions: chronicConditions || null,
    currentMedications: currentMedications || null,
  };
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: health.data }),
    prisma.passport.upsert({ where: { userId }, create: { userId, ...details }, update: details }),
  ]);

  revalidatePath("/", "layout"); // the profile page shows the same details
  return { saved: true };
}
