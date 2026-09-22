"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

// true in the browser, false while rendering on the server (same trick as Drawer.tsx).
const subscribeToNothing = () => () => {};
const useIsBrowser = () => useSyncExternalStore(subscribeToNothing, () => true, () => false);

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger?: boolean; // red confirm button, for something that can't be undone
  pending?: boolean; // the confirmed action is in flight: disable both buttons and say so
};

// A small centered "are you sure?" dialog, for an action that shouldn't happen from one click alone
// (deleting something, signing out). Focus starts on Cancel, not Confirm, so an accidental Enter or
// Space right after opening it doesn't go through with it.
export default function ConfirmDialog({ open, title, description, confirmLabel, onCancel, onConfirm, danger = false, pending = false }: Props) {
  const isBrowser = useIsBrowser();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Always call the latest onCancel without restarting the effect below on every render.
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  });
  const cancel = useCallback(() => {
    if (!pending) onCancelRef.current();
  }, [pending]);

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null; // the button that opened the dialog
    cancelRef.current?.focus();
    const appShell = document.getElementById("app-shell");
    if (appShell) appShell.inert = true;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      if (appShell) appShell.inert = false;
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [open, cancel]);

  if (!isBrowser || !open) return null;

  return createPortal(
    <>
      <div onClick={cancel} aria-hidden="true" className="fixed inset-0 z-40 bg-slate-900/40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={panelRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-2xl"
        >
          <div className="space-y-1">
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-slate-900">{title}</h2>
            <p id="confirm-dialog-description" className="text-sm text-slate-600">{description}</p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button ref={cancelRef} type="button" onClick={cancel} disabled={pending} className="btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={pending} className={danger ? "btn-danger" : "btn-primary"}>
              {pending ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
