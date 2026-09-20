// The emergency health passport: a card whose QR code shows life-critical details to anyone who scans it.
// The QR format is the same as the Emergency Health Passport app ("v": 1), so its scanner can read our cards.

export const SEXES = ["male", "female", "other"] as const;
export const MAX_PASSPORT_TEXT = 200; // per free-text field, so the QR code stays easy to scan

// Everything the card shows. dateOfBirth is "YYYY-MM-DD"; updatedAt is an ISO date-time.
export type PassportData = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  sex: string;
  bloodGroup: string | null;
  genotype: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  currentMedications: string | null;
  emergencyContact: { name: string; phone: string } | null;
  updatedAt: string;
};

// The short keys keep the QR code small.
export type QrPayload = {
  v: 1;
  id: string;
  n: string;
  dob: string;
  sex: string;
  bg: string | null;
  gt: string | null;
  al: string | null;
  cc: string | null;
  cm: string | null;
  ec: { n: string; p: string } | null;
  u: string;
};

export function toQrPayload(p: PassportData): QrPayload {
  return {
    v: 1,
    id: p.id,
    n: p.fullName,
    dob: p.dateOfBirth,
    sex: p.sex,
    bg: p.bloodGroup,
    gt: p.genotype,
    al: p.allergies,
    cc: p.chronicConditions,
    cm: p.currentMedications,
    ec: p.emergencyContact ? { n: p.emergencyContact.name, p: p.emergencyContact.phone } : null,
    u: p.updatedAt,
  };
}

// The QR code holds this address. It opens our scan page in any phone camera, and the passport app's
// scanner reads the "d" part. All the details travel inside the address, so no lookup is needed.
export function buildScanUrl(p: PassportData, origin: string): string {
  return `${origin}/scan/${p.id}?d=${encodeURIComponent(JSON.stringify(toQrPayload(p)))}`;
}

const isText = (value: unknown, max = 400): value is string => typeof value === "string" && value.length <= max;
const isTextOrNull = (value: unknown): value is string | null => value === null || isText(value);

// Reads the "d" part of a scan address. The scan page is public, so check every field before showing it.
export function decodeQrPayload(encoded: string): QrPayload | null {
  try {
    const p = JSON.parse(decodeURIComponent(encoded));
    if (!p || typeof p !== "object" || p.v !== 1) return null;
    const contactOk = p.ec === null || (p.ec && typeof p.ec === "object" && isText(p.ec.n) && isText(p.ec.p, 60));
    if (!isText(p.id, 80) || !isText(p.n) || !isText(p.dob, 40) || !isText(p.sex, 20) || !isText(p.u, 40)) return null;
    if (![p.bg, p.gt, p.al, p.cc, p.cm].every(isTextOrNull) || !contactOk) return null;
    return p as QrPayload;
  } catch {
    return null;
  }
}

// ---- helpers for showing the details ----

export function formatDob(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function calculateAge(iso: string): number | null {
  const born = new Date(iso);
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  if (now.getUTCMonth() < born.getUTCMonth() || (now.getUTCMonth() === born.getUTCMonth() && now.getUTCDate() < born.getUTCDate())) age--;
  return age;
}

export function sexLabel(sex: string): string {
  return sex === "male" ? "Male" : sex === "female" ? "Female" : "Other";
}

// Someone who types "None known", "None" or "NKDA" has answered: they have no allergies.
// That is different from leaving the box empty, which means "not provided" and is never read as "none".
export function saysNone(value: string | null | undefined): boolean {
  return Boolean(value) && /^\s*(none\b|nil\b|nka\b|nkda\b|no known\b|no allergies\b|no allergy\b)/i.test(value as string);
}

export function orNotProvided(value: string | null | undefined): string {
  return value && value.trim() ? value : "Not provided";
}
