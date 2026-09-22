import type { Metadata } from "next";
import Link from "next/link";
import { calculateAge, decodeQrPayload, formatDob, orNotProvided, saysNone, sexLabel } from "@/lib/passport";

// Public page: opened by scanning a passport QR code. No login needed. It never touches the database:
// everything shown comes from the address itself, which is exactly what is printed in the QR code.
export const metadata: Metadata = { title: "Emergency health passport", robots: { index: false, follow: false } };

const phoneLink = (phone: string) => phone.replace(/[^\d+]/g, ""); // keep only digits and +, for tel: and sms: links

export default async function ScanPage({ params, searchParams }: PageProps<"/scan/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const encoded = Array.isArray(query.d) ? query.d[0] : query.d;
  const payload = encoded ? decodeQrPayload(encoded) : null;

  // The id in the address must match the one inside the data, so a scrambled link isn't shown as a real card.
  if (!payload || payload.id !== id) {
    return (
      <div className="card mx-auto max-w-md space-y-2 text-center">
        <p className="text-lg font-semibold text-slate-900">This card couldn&apos;t be read</p>
        <p className="text-slate-600">Try scanning the QR code again, or ask the card holder for help.</p>
      </div>
    );
  }

  const age = calculateAge(payload.dob);
  const noAllergies = saysNone(payload.al);
  const hasAllergies = Boolean(payload.al?.trim()) && !noAllergies;
  const incomplete = !payload.bg || !payload.gt || !payload.al || !payload.cc || !payload.cm || !payload.ec;
  const contact = payload.ec;

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Emergency health passport · card updated {formatDob(payload.u)}
      </p>

      {incomplete && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
          This card is incomplete. Treat anything marked &quot;not provided&quot; as unknown, not as none.
        </p>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{payload.n}</h1>
        <p className="text-slate-600">
          {age !== null ? `${age} years` : formatDob(payload.dob)} · {sexLabel(payload.sex)} · born {formatDob(payload.dob)}
        </p>
      </div>

      <div
        className={`rounded-xl border px-4 py-3 ${
          hasAllergies
            ? "border-red-200 bg-red-50 text-red-800"
            : noAllergies
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide">Allergies</p>
        <p className="mt-0.5 font-medium">{hasAllergies ? payload.al : noAllergies ? "No known allergies" : "Not provided. Do not assume none."}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500">Blood group</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{payload.bg ?? "—"}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500">Genotype</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{payload.gt ?? "—"}</p>
        </div>
      </div>

      <dl className="card divide-y divide-slate-100 p-0! text-sm">
        <ScanRow label="Ongoing conditions" value={orNotProvided(payload.cc)} />
        <ScanRow label="Regular medicines" value={orNotProvided(payload.cm)} />
        <ScanRow label="Emergency contact" value={contact ? `${contact.n} · ${contact.p}` : "Not provided"} />
      </dl>

      {contact && phoneLink(contact.p) && (
        <div className="space-y-2.5">
          <a href={`tel:${phoneLink(contact.p)}`} className="btn-primary w-full">Call {contact.n}</a>
          <a href={`sms:${phoneLink(contact.p)}`} className="btn-secondary w-full">Send an SMS instead</a>
        </div>
      )}

      <p className="pt-2 text-center text-xs text-slate-500">
        This page shows only life-critical details the card holder chose to include. It is not a medical record.{" "}
        <Link href="/" className="underline">Health Journal</Link>
      </p>
    </div>
  );
}

function ScanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
    </div>
  );
}
