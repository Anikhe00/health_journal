"use client";

import { TrashIcon } from "@/components/ListRows";

export default function DeleteEntryButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Delete this entry? This cannot be undone.")) event.preventDefault();
      }}
    >
      <button type="submit" className="btn-danger gap-2 max-sm:size-10 max-sm:p-0" aria-label="Delete entry">
        <TrashIcon className="size-5 shrink-0" />
        <span className="max-sm:sr-only">Delete</span>
      </button>
    </form>
  );
}
