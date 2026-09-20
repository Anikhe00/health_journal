// The plain rules for share links. Safe to use in the browser (no database or server code here).

// How long a share link works.
export const EXPIRY_OPTIONS = [
  { hours: 24, label: "24 hours" },
  { hours: 24 * 7, label: "7 days" },
  { hours: 24 * 30, label: "30 days" },
] as const;

export const MAX_SHARE_ENTRIES = 200;

export type ShareStatus = "active" | "expired" | "off";

export function shareStatus(share: { revokedAt: Date | null; expiresAt: Date }): ShareStatus {
  if (share.revokedAt) return "off";
  return share.expiresAt.getTime() > Date.now() ? "active" : "expired";
}
