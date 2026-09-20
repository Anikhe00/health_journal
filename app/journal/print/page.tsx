import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { formatLongDate, toInputValue } from "@/lib/dates";
import { calculateAge } from "@/lib/passport";
import { parseTags } from "@/lib/tags";
import Markdown from "@/components/Markdown";
import Photo from "@/components/Photo";
import TagBadges from "@/components/TagBadges";
import PrintButton from "@/app/journal/print/PrintButton";

// The whole journal laid out to print, or to save as a PDF from the print box.
export default async function PrintJournalPage() {
  const userId = await requireUserId();

  const [user, passport, entries] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.passport.findUnique({ where: { userId } }),
    prisma.entry.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: { attachments: { orderBy: { createdAt: "asc" }, select: { id: true, fileName: true } } },
    }),
  ]);
  if (!user) return null;

  const age = user.dateOfBirth ? calculateAge(toInputValue(user.dateOfBirth)) : null;
  const facts = [
    user.dateOfBirth ? `Born ${formatLongDate(user.dateOfBirth)}${age !== null ? ` (${age} years)` : ""}` : null,
    user.bloodGroup ? `Blood group ${user.bloodGroup}` : null,
    user.genotype ? `Genotype ${user.genotype}` : null,
    user.emergencyContactPhone ? `Emergency contact ${user.emergencyContactName ? `${user.emergencyContactName}, ` : ""}${user.emergencyContactPhone}` : null,
  ].filter(Boolean);

  const summary = [
    ["Allergies", passport?.allergies],
    ["Ongoing conditions", passport?.chronicConditions],
    ["Regular medicines", passport?.currentMedications],
  ].filter((row): row is [string, string] => Boolean(row[1]));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Print your journal</h1>
          <p className="text-sm text-slate-600">This is how your journal will look on paper. Choose &quot;Save as PDF&quot; in the print box to keep a copy.</p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <Link href="/profile" className="btn-secondary">Back</Link>
        </div>
      </div>

      <header className="space-y-1 border-b border-slate-300 pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Health journal</p>
        <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
        {facts.length > 0 && <p className="text-sm text-slate-700">{facts.join(" · ")}</p>}
        <p className="text-xs text-slate-500">
          Printed on {formatLongDate(new Date())}. This is the patient&apos;s own journal, not an official medical record.
        </p>
      </header>

      {summary.length > 0 && (
        <dl className="space-y-1 text-sm break-inside-avoid">
          {summary.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="w-40 shrink-0 font-semibold text-slate-700">{label}</dt>
              <dd className="text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {entries.length === 0 ? (
        <p className="text-slate-600">There are no entries yet.</p>
      ) : (
        <ul className="space-y-5">
          {entries.map((entry) => (
            <li key={entry.id} className="space-y-2 border-b border-slate-200 pb-5 break-inside-avoid last:border-0">
              <p className="text-sm font-semibold text-slate-500">{formatLongDate(entry.date)}</p>
              <h3 className="text-lg font-bold text-slate-900">{entry.title}</h3>
              <TagBadges tags={parseTags(entry.tags)} />
              {entry.body && <Markdown>{entry.body}</Markdown>}
              {entry.attachments.length > 0 && (
                <ul className="grid grid-cols-3 gap-2 pt-1">
                  {entry.attachments.map((image) => (
                    <li key={image.id} className="aspect-square overflow-hidden rounded-lg border border-slate-200">
                      <Photo src={`/api/attachments/${image.id}`} alt={image.fileName} className="size-full object-cover" />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
