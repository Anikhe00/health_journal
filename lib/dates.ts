// Entry dates are calendar dates (no time of day). We store them as UTC midnight
// and always format them in UTC so they never shift by a day between timezones.

// The app is aimed at Nigeria, so "today" is today in Lagos regardless of server timezone.
export function todayInputValue(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date()); // YYYY-MM-DD
}

// "Good morning" / "Good afternoon" / "Good evening", by the hour in Lagos.
export function greetingForNow(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Lagos" }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// "2026-09-20" -> Date, or null if it isn't a real date.
export function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Date -> "2026-09-20" for <input type="date">.
export function toInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// "Sunday, 20 September 2026"
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// "27 Sep, 10:30"
export function formatDateTime(date: Date, timeZone = "Africa/Lagos"): string {
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone });
}
