import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { calculateAge } from "@/lib/passport";
import { formatDateTime, formatLongDate, toInputValue } from "@/lib/dates";
import { findActiveShare } from "@/lib/share";
import { parseTags } from "@/lib/tags";
import Markdown from "@/components/Markdown";
import Photo from "@/components/Photo";
import TagBadges from "@/components/TagBadges";

// Public page: what a clinician sees when they open a share link. No login needed.
// The link is a secret, so search engines and other sites must never see it.
export const metadata: Metadata = {
  title: "Shared health journal",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function SharedJournalPage({ params }: PageProps<"/share/[token]">) {
  const { token } = await params;
  const share = await findActiveShare(token);
  if (!share) notFound();

  const [patient, entries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: share.userId },
      select: { name: true, dateOfBirth: true, bloodGroup: true, genotype: true },
    }),
    prisma.entry.findMany({
      where: { shareEntries: { some: { shareId: share.id } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: { attachments: { orderBy: { createdAt: "asc" }, select: { id: true, fileName: true } } },
    }),
  ]);
  if (!patient) notFound();

  // So the patient can see that it was opened.
  await prisma.share.update({ where: { id: share.id }, data: { viewCount: { increment: 1 }, lastViewedAt: new Date() } });

  const age = patient.dateOfBirth ? calculateAge(toInputValue(patient.dateOfBirth)) : null;
  const facts = [
    patient.dateOfBirth ? `Born ${formatLongDate(patient.dateOfBirth)}${age !== null ? ` (${age} years)` : ""}` : null,
    patient.bloodGroup ? `Blood group ${patient.bloodGroup}` : null,
    patient.genotype ? `Genotype ${patient.genotype}` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Health journal shared with you</p>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{patient.name}</h1>
        {facts.length > 0 && <p className="text-sm text-slate-600">{facts.join(" · ")}</p>}
      </div>

      <p className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600">
        The patient chose to share these {entries.length === 1 ? "entry" : `${entries.length} entries`} with you. This link works until {formatDateTime(share.expiresAt)}.
        It is the patient&apos;s own journal, not an official medical record.
      </p>

      {entries.length === 0 ? (
        <p className="text-slate-600">There is nothing to show. The shared entries may have been deleted.</p>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <article className="card space-y-3">
                <p className="text-sm font-semibold text-slate-500">{formatLongDate(entry.date)}</p>
                <h2 className="text-lg font-bold text-slate-900">{entry.title}</h2>
                <TagBadges tags={parseTags(entry.tags)} />
                {entry.body && <Markdown>{entry.body}</Markdown>}

                {entry.attachments.length > 0 && (
                  <ul className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-3">
                    {entry.attachments.map((image) => (
                      <li key={image.id}>
                        <a
                          href={`/api/share/${token}/images/${image.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                        >
                          <Photo src={`/api/share/${token}/images/${image.id}`} alt={image.fileName} className="size-full object-cover" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
