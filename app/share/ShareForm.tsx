"use client";

import { useActionState, useId, useState } from "react";
import { createShare } from "@/app/share/actions";
import { useCloseDrawer } from "@/components/Drawer";
import DrawerFormLayout from "@/components/DrawerFormLayout";
import TagBadges from "@/components/TagBadges";
import { EXPIRY_OPTIONS } from "@/lib/share-options";
import type { Tag } from "@/lib/tags";

type EntryOption = { id: string; title: string; date: string; tags: Tag[] };

// "Create a link": choose the entries, how long the link works, and (optionally) who it is for.
// Once made, the same drawer shows the link, which is only ever shown this once.
export default function ShareForm({ entries }: { entries: EntryOption[] }) {
  const [state, formAction, pending] = useActionState(createShare, undefined);
  const close = useCloseDrawer();
  const id = useId();
  const [selected, setSelected] = useState<string[]>([]);

  if (state?.url) return <LinkReady url={state.url} onDone={close} />;

  const allSelected = entries.length > 0 && selected.length === entries.length;
  const toggle = (entryId: string) =>
    setSelected((current) => (current.includes(entryId) ? current.filter((e) => e !== entryId) : [...current, entryId]));

  return (
    <DrawerFormLayout action={formAction} pending={pending} error={state?.error} submitLabel="Create link" pendingLabel="Creating…">
      <div>
        <label htmlFor={`${id}-label`} className="label">Who is it for? (optional)</label>
        <input id={`${id}-label`} name="label" type="text" maxLength={80} placeholder="e.g. Dr Bello, General Hospital" className="input" />
      </div>

      <div>
        <label htmlFor={`${id}-hours`} className="label">The link works for</label>
        <select id={`${id}-hours`} name="hours" defaultValue={String(24 * 7)} className="input">
          {EXPIRY_OPTIONS.map((option) => (
            <option key={option.hours} value={option.hours}>{option.label}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <div className="mb-2 flex items-center justify-between">
          <legend className="label mb-0!">Entries to share ({selected.length} chosen)</legend>
          {entries.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected(allSelected ? [] : entries.map((entry) => entry.id))}
              className="text-sm font-medium text-teal-700 underline"
            >
              {allSelected ? "Clear all" : "Choose all"}
            </button>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="text-sm text-slate-600">You don&apos;t have any journal entries to share yet.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50/50">
                  <input
                    type="checkbox"
                    name="entryId"
                    value={entry.id}
                    checked={selected.includes(entry.id)}
                    onChange={() => toggle(entry.id)}
                    className="mt-1 size-4 shrink-0 accent-teal-700"
                  />
                  <span className="min-w-0 space-y-1">
                    <span className="block font-medium text-slate-900">{entry.title}</span>
                    <span className="block text-xs text-slate-500">{entry.date}</span>
                    <TagBadges tags={entry.tags} />
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
    </DrawerFormLayout>
  );
}

function LinkReady({ url, onDone }: { url: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const canSend = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Copying can be blocked; the link is selectable in the box above instead.
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <p className="form-success" role="status">Your link is ready.</p>

        <div>
          <label htmlFor="share-link" className="label">Link</label>
          <input id="share-link" readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="input" />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" onClick={copy} className="btn-primary flex-1">{copied ? "Copied" : "Copy link"}</button>
          {canSend && (
            <button type="button" onClick={() => navigator.share({ title: "My health journal", url }).catch(() => {})} className="btn-secondary flex-1">
              Send…
            </button>
          )}
        </div>

        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
          This is the only time you&apos;ll see this link, so copy it now. Anyone who has it can read the entries you chose until it expires.
          You can turn it off any time from the Share page.
        </p>
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <button type="button" onClick={onDone} className="btn-secondary w-full">Done</button>
      </div>
    </div>
  );
}
