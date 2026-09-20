"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

// Lets a form inside a drawer close it (Cancel button, or after a successful save).
const CloseDrawerContext = createContext<() => void>(() => {});
export const useCloseDrawer = () => useContext(CloseDrawerContext);

// true in the browser, false while rendering on the server (drawers are only drawn in the browser).
const subscribeToNothing = () => () => {};
const useIsBrowser = () => useSyncExternalStore(subscribeToNothing, () => true, () => false);

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode; // usually a <DrawerFormLayout>
};

// A panel that slides in from the right over a dimmed backdrop.
// It is drawn on <body>, outside #app-shell, so the whole app behind it can be made inert while it is open.
export default function Drawer({ open, onClose, title, children }: Props) {
  const isBrowser = useIsBrowser();
  const panelRef = useRef<HTMLDivElement>(null);

  // Always call the latest onClose without restarting the effect below on every render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  const close = useCallback(() => onCloseRef.current(), []);

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null; // the button that opened the drawer
    panelRef.current?.focus();
    // While the drawer is open, nothing behind it can be clicked, scrolled or tabbed to.
    const appShell = document.getElementById("app-shell");
    if (appShell) appShell.inert = true;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      if (appShell) appShell.inert = false;
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus(); // runs after the drawer has closed: put keyboard focus back where it was
    };
  }, [open]);

  if (!isBrowser) return null;

  return createPortal(
    <CloseDrawerContext.Provider value={close}>
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-slate-50 shadow-2xl outline-none transition-transform duration-300 ease-out motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-lg px-3 py-1.5 text-2xl leading-none text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </CloseDrawerContext.Provider>,
    document.body,
  );
}
