// The fixed list of tags an entry can have.
export const TAGS = [
  "Diagnosis",
  "Medication",
  "Symptom",
  "Doctor's Note",
  "Procedure",
  "Lab Result",
  "General Note",
] as const;

export type Tag = (typeof TAGS)[number];

export function isTag(value: string): value is Tag {
  return (TAGS as readonly string[]).includes(value);
}

// Tags are stored in one text column as "Diagnosis,Lab Result" (SQLite has no list type).
export function parseTags(stored: string): Tag[] {
  return stored.split(",").filter(isTag);
}

export function serializeTags(tags: string[]): string {
  // Drop anything not in the fixed list and any duplicates.
  return [...new Set(tags.filter(isTag))].join(",");
}

// Small colour per tag so the timeline is easy to scan.
export const TAG_STYLES: Record<Tag, string> = {
  Diagnosis: "bg-rose-100 text-rose-800",
  Medication: "bg-sky-100 text-sky-800",
  Symptom: "bg-amber-100 text-amber-800",
  "Doctor's Note": "bg-violet-100 text-violet-800",
  Procedure: "bg-orange-100 text-orange-800",
  "Lab Result": "bg-emerald-100 text-emerald-800",
  "General Note": "bg-slate-100 text-slate-700",
};
