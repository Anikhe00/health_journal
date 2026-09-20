import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { formatDateTime, formatLongDate } from "@/lib/dates";
import { shareStatus } from "@/lib/share-options";
import { parseTags } from "@/lib/tags";
import DrawerButton from "@/components/DrawerButton";
import { revokeShare } from "@/app/share/actions";
import ShareForm from "@/app/share/ShareForm";

export default async function SharePage() {
  const userId = await requireUserId();

  const [shares, entries] = await Promise.all([
    prisma.share.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { _count: { select: { entries: true } } },
    }),
    prisma.entry.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: { id: true, title: true, date: true, tags: true },
    }),
  ]);

  const active = shares.filter((share) => shareStatus(share) === "active");
  const past = shares.filter((share) => shareStatus(share) !== "active").slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Share with a clinician</h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Choose the entries you want to show and get a private link. Whoever has the link can read only those entries, until it expires or you turn it off.
        </p>
      </div>

      <DrawerButton title="Create a link" buttonClassName="btn-primary w-full sm:w-auto" button="Create a link">
        <ShareForm
          entries={entries.map((entry) => ({
            id: entry.id,
            title: entry.title,
            date: formatLongDate(entry.date),
            tags: parseTags(entry.tags),
          }))}
        />
      </DrawerButton>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-500">Active links</h2>
        {active.length === 0 ? (
          <p className="text-sm text-slate-600">You have no active links.</p>
        ) : (
          <ul className="space-y-3">
            {active.map((share) => (
              <li key={share.id} className="card space-y-3">
                <ShareSummary share={share} />
                <form action={revokeShare.bind(null, share.id)}>
                  <button type="submit" className="btn-danger">Turn off this link</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-500">Earlier links</h2>
          <ul className="space-y-3">
            {past.map((share) => (
              <li key={share.id} className="card space-y-1 opacity-70">
                <ShareSummary share={share} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ShareSummary({
  share,
}: {
  share: { label: string | null; expiresAt: Date; revokedAt: Date | null; viewCount: number; lastViewedAt: Date | null; _count: { entries: number } };
}) {
  const status = shareStatus(share);
  const entries = `${share._count.entries} ${share._count.entries === 1 ? "entry" : "entries"}`;

  return (
    <div className="space-y-0.5 text-sm">
      <p className="text-base font-semibold text-slate-900">{share.label ?? "Link with no name"}</p>
      <p className="text-slate-600">
        {entries} · {status === "off" ? "Turned off" : status === "expired" ? `Expired ${formatDateTime(share.expiresAt)}` : `Works until ${formatDateTime(share.expiresAt)}`}
      </p>
      <p className="text-slate-500">
        {share.viewCount === 0
          ? "Not opened yet"
          : `Opened ${share.viewCount} ${share.viewCount === 1 ? "time" : "times"}${share.lastViewedAt ? `, last on ${formatDateTime(share.lastViewedAt)}` : ""}`}
      </p>
    </div>
  );
}
