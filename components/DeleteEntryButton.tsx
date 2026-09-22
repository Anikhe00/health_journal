"use client";

import { useState, useTransition } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { TrashIcon } from "@/components/ListRows";

export default function DeleteEntryButton({ action }: { action: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-danger gap-2 max-sm:size-10 max-sm:p-0" aria-label="Delete entry">
        <TrashIcon className="size-5 shrink-0" />
        <span className="max-sm:sr-only">Delete</span>
      </button>

      <ConfirmDialog
        open={open}
        title="Delete this entry?"
        description="This cannot be undone. Its photos will be deleted too."
        confirmLabel="Delete entry"
        danger
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => startTransition(action)}
      />
    </>
  );
}
