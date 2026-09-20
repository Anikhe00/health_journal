"use client";

import { useCloseDrawer } from "@/components/Drawer";

type Props = {
  action: (formData: FormData) => void;
  submitLabel: string;
  pendingLabel: string;
  pending: boolean;
  error?: string;
  danger?: boolean; // red submit button, for things that can't be undone
  children: React.ReactNode;
};

// The layout for a form in a drawer: the fields scroll, while the Cancel and Submit buttons stay fixed at the bottom.
export default function DrawerFormLayout({ action, submitLabel, pendingLabel, pending, error, danger, children }: Props) {
  const close = useCloseDrawer();

  return (
    <form action={action} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-4">{children}</div>

      <div className="space-y-3 border-t border-slate-200 bg-white p-4">
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={close} className="btn-secondary">Cancel</button>
          <button
            type="submit"
            disabled={pending}
            className={danger ? "btn bg-red-700 text-white hover:bg-red-800" : "btn-primary"}
          >
            {pending ? pendingLabel : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
