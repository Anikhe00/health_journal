import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { toInputValue } from "@/lib/dates";
import { parseTags } from "@/lib/tags";
import { updateEntry } from "@/app/entries/actions";
import EntryForm from "@/components/EntryForm";

export default async function EditEntryPage({ params }: PageProps<"/entries/[id]/edit">) {
  const userId = await requireUserId();
  const { id } = await params;

  const entry = await prisma.entry.findFirst({
    where: { id, userId },
    include: { attachments: { orderBy: { createdAt: "asc" }, select: { id: true, fileName: true } } },
  });
  if (!entry) notFound();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-900">Edit entry</h1>
      <div className="card">
        <EntryForm
          action={updateEntry.bind(null, entry.id)}
          initial={{
            date: toInputValue(entry.date),
            title: entry.title,
            body: entry.body,
            tags: parseTags(entry.tags),
          }}
          existingImages={entry.attachments}
          submitLabel="Save changes"
          cancelHref={`/entries/${entry.id}`}
        />
      </div>
    </div>
  );
}
