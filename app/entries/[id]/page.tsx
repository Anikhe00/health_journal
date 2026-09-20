import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { formatLongDate, toInputValue } from "@/lib/dates";
import { parseTags } from "@/lib/tags";
import { deleteEntry, updateEntry } from "@/app/entries/actions";
import Markdown from "@/components/Markdown";
import Photo from "@/components/Photo";
import TagBadges from "@/components/TagBadges";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import { EntryDrawerProvider, OpenEntryDrawerButton } from "@/components/EntryDrawer";

export default async function EntryPage({ params }: PageProps<"/entries/[id]">) {
  const userId = await requireUserId();
  const { id } = await params;

  // Looking up by id AND userId: other people's entries come back as "not found".
  const entry = await prisma.entry.findFirst({
    where: { id, userId },
    include: { attachments: { orderBy: { createdAt: "asc" }, select: { id: true, fileName: true } } },
  });
  if (!entry) notFound();

  return (
    // The key makes the drawer start fresh (closed, with the saved values) after each save.
    <EntryDrawerProvider
      key={entry.updatedAt.toISOString()}
      title="Edit entry"
      action={updateEntry.bind(null, entry.id)}
      initial={{
        date: toInputValue(entry.date),
        title: entry.title,
        body: entry.body,
        tags: parseTags(entry.tags),
      }}
      existingImages={entry.attachments}
      submitLabel="Save changes"
    >
      <div className="space-y-5">
        <Link href="/dashboard" className="inline-block text-sm font-medium text-teal-700 underline">
          ← Back to timeline
        </Link>

        <article className="card space-y-3">
          <p className="text-sm font-semibold text-slate-500">{formatLongDate(entry.date)}</p>
          <h1 className="text-2xl font-bold text-slate-900">{entry.title}</h1>
          <TagBadges tags={parseTags(entry.tags)} />
          {entry.body ? <Markdown>{entry.body}</Markdown> : <p className="text-slate-500">No details added.</p>}

          {entry.attachments.length > 0 && (
            <section className="space-y-2 border-t border-slate-100 pt-3">
              <h2 className="text-sm font-semibold text-slate-500">Supporting images</h2>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {entry.attachments.map((image) => (
                  <li key={image.id}>
                    {/* Opens the full-size image in a new tab. */}
                    <a
                      href={`/api/attachments/${image.id}`}
                      target="_blank"
                      rel="noopener"
                      className="block aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <Photo src={`/api/attachments/${image.id}`} alt={image.fileName} className="size-full object-cover" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <OpenEntryDrawerButton className="btn-primary">Edit entry</OpenEntryDrawerButton>
          <DeleteEntryButton action={deleteEntry.bind(null, entry.id)} />
        </div>
      </div>
    </EntryDrawerProvider>
  );
}
