export const DISCLAIMER_TEXT =
  "This is a personal journal, not a substitute for official medical records or emergency care.";

export default function Disclaimer() {
  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
      {DISCLAIMER_TEXT}
    </p>
  );
}
