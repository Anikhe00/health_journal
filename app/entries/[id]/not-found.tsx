import Link from "next/link";

export default function EntryNotFound() {
  return (
    <div className="card space-y-3 text-center">
      <p className="text-lg font-semibold text-slate-900">We couldn&apos;t find that entry</p>
      <p className="text-slate-600">It may have been deleted.</p>
      <Link href="/dashboard" className="btn-primary">Back to timeline</Link>
    </div>
  );
}
