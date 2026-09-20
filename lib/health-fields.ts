import { BLOOD_GROUPS } from "@/lib/blood-groups";
import { parseDateInput } from "@/lib/dates";
import { GENOTYPES } from "@/lib/genotypes";

// The personal health details that appear on both the profile and the health passport.
// Both forms read and check them here, so the two always agree.
export function readHealthFields(formData: FormData, today: string) {
  const dobInput = String(formData.get("dateOfBirth") ?? "");
  const bloodGroup = String(formData.get("bloodGroup") ?? "");
  const genotype = String(formData.get("genotype") ?? "");
  const emergencyContactName = String(formData.get("emergencyContactName") ?? "").trim();
  const emergencyContactPhone = String(formData.get("emergencyContactPhone") ?? "").trim();

  let dateOfBirth: Date | null = null;
  if (dobInput) {
    dateOfBirth = parseDateInput(dobInput);
    if (!dateOfBirth || dobInput > today) return { error: "Please enter a valid date of birth." };
  }
  if (bloodGroup && !(BLOOD_GROUPS as readonly string[]).includes(bloodGroup)) {
    return { error: "Please choose a blood group from the list." };
  }
  if (genotype && !(GENOTYPES as readonly string[]).includes(genotype)) {
    return { error: "Please choose a genotype from the list." };
  }

  return {
    data: {
      dateOfBirth,
      bloodGroup: bloodGroup || null,
      genotype: genotype || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactPhone: emergencyContactPhone || null,
    },
  };
}
