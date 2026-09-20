import { cookies } from "next/headers";

// Used when we don't know the visitor's timezone yet (their first page view, or a program instead of a browser).
export const DEFAULT_TIMEZONE = process.env.DEFAULT_TIMEZONE || "Africa/Lagos";

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

// The visitor's timezone, remembered in a "tz" cookie by <TimezoneCookie />. Anything odd falls back to the default.
export async function getTimeZone(): Promise<string> {
  const stored = (await cookies()).get("tz")?.value;
  if (!stored) return DEFAULT_TIMEZONE;
  try {
    const timeZone = decodeURIComponent(stored);
    return isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}
