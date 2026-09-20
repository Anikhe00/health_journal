import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { formatLongDate, greetingForNow, toInputValue } from "@/lib/dates";
import { TAGS, isTag, parseTags } from "@/lib/tags";
import { plainPreview } from "@/lib/text";
import TagBadges from "@/components/TagBadges";
import SearchBox from "@/components/SearchBox";
import TagFilter from "@/components/TagFilter";
import { OpenEntryDrawerButton } from "@/components/EntryDrawer";

// Search params can be a string, an array, or missing. We only want one string.
function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// Link to the timeline with a given tag/keyword, keeping the other filter.
function timelineHref(tag: string, q: string): string {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (q) params.set("q", q);
  const query = params.toString();
  return query ? `/dashboard?${query}` : "/dashboard";
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const userId = await requireUserId();
  const params = await searchParams;
  const q = firstValue(params.q).trim();
  const tagParam = firstValue(params.tag);
  const tag = isTag(tagParam) ? tagParam : "";

  const where: Prisma.EntryWhereInput = { userId };
  if (tag) where.tags = { contains: tag };
  if (q) where.OR = [{ title: { contains: q } }, { body: { contains: q } }];

  const [user, entries, totalCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.entry.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: { _count: { select: { attachments: true } } },
    }),
    prisma.entry.count({ where: { userId } }),
  ]);

  // Group the (already sorted) entries by calendar date.
  const groups: { date: Date; entries: typeof entries }[] = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && toInputValue(last.date) === toInputValue(entry.date)) last.entries.push(entry);
    else groups.push({ date: entry.date, entries: [entry] });
  }

  const isFiltering = Boolean(tag || q);
  const firstName = user?.name.split(" ")[0];

  // data-fill-height: the page fills the screen; only the entries list below scrolls.
  return (
    <div data-fill-height className="flex h-full flex-col gap-4 sm:gap-5">
      <div className="shrink-0 space-y-4 sm:space-y-5">
        <div className="space-y-1">
          <h1 className="min-w-0 text-xl font-bold text-slate-900 sm:text-2xl">
            {greetingForNow()}
            {firstName && `, ${firstName}`}
          </h1>
          <p className="text-sm text-slate-600 sm:text-base">
            {totalCount === 0
              ? "Your health journal starts here."
              : `Here's your health journal. ${totalCount} ${totalCount === 1 ? "entry" : "entries"} so far.`}
          </p>
        </div>

        {totalCount > 0 && (
          <div className="space-y-3">
            <SearchBox />

            <TagFilter
              items={["", ...TAGS].map((t) => ({ label: t || "All", href: timelineHref(t, q), active: t === tag }))}
            />
          </div>
        )}
      </div>

      <div className="no-scrollbar -mx-1 min-h-0 flex-1 space-y-5 overflow-y-auto px-1 pb-4">
        {totalCount === 0 && (
          <div className="card space-y-3 text-center">
            <p className="text-lg font-semibold text-slate-900">Your journal is empty</p>
            <p className="text-slate-600">
              Write down a diagnosis, a medicine you were given, or how you felt today. It only takes a minute.
            </p>
            <OpenEntryDrawerButton className="btn-primary">Write your first entry</OpenEntryDrawerButton>
          </div>
        )}

        {totalCount > 0 && entries.length === 0 && (
          <div className="card space-y-3 text-center">
            <p className="text-slate-700">No entries match your search.</p>
            <Link href="/dashboard" className="btn-secondary">Clear search and filters</Link>
          </div>
        )}

        {groups.map((group) => (
          <section key={toInputValue(group.date)} className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-500">{formatLongDate(group.date)}</h2>
            <ul className="space-y-2 sm:space-y-4">
              {group.entries.map((entry) => (
                <li key={entry.id}>
                  <Link href={`/entries/${entry.id}`} className="card block space-y-1.5 hover:border-teal-600">
                    <p className="font-semibold text-slate-900">{entry.title}</p>
                    <TagBadges tags={parseTags(entry.tags)} />
                    {entry.body && <p className="text-sm text-slate-600">{plainPreview(entry.body)}</p>}
                    {entry._count.attachments > 0 && (
                      <p className="text-xs font-medium text-slate-500">
                        {entry._count.attachments} {entry._count.attachments === 1 ? "image" : "images"} attached
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {isFiltering && entries.length > 0 && (
          <p className="text-center text-sm text-slate-500">
            Showing {entries.length} of {totalCount} entries.{" "}
            <Link href="/dashboard" className="font-medium text-teal-700 underline">Show all</Link>
          </p>
        )}
      </div>
    </div>
  );
}
