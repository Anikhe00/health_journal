"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import Drawer from "@/components/Drawer";
import EntryForm from "@/components/EntryForm";

const OpenDrawerContext = createContext<(() => void) | null>(null);

type FormProps = React.ComponentProps<typeof EntryForm>;

type Props = Pick<FormProps, "action" | "initial" | "existingImages" | "submitLabel"> & {
  title: string; // "New entry" or "Edit entry"
  children: React.ReactNode;
};

// Wrap part of the app in this to get an entry form in a drawer that slides in from the right.
// Any <OpenEntryDrawerButton> inside opens the nearest drawer. Used for both "new" and "edit".
export function EntryDrawerProvider({ title, action, initial, existingImages, submitLabel, children }: Props) {
  const pathname = usePathname();
  // Open only on the page it was opened from, so moving to another page closes it (and resets the form).
  const [openedOn, setOpenedOn] = useState<string | null>(null);

  const openDrawer = useCallback(() => setOpenedOn(pathname), [pathname]);
  const closeDrawer = useCallback(() => setOpenedOn(null), []);

  return (
    <OpenDrawerContext.Provider value={openDrawer}>
      {children}

      <Drawer open={openedOn === pathname} onClose={closeDrawer} title={title}>
        {/* key: a fresh, empty form after moving to another page */}
        <EntryForm
          key={pathname}
          action={action}
          initial={initial}
          existingImages={existingImages}
          submitLabel={submitLabel}
          onCancel={closeDrawer}
        />
      </Drawer>
    </OpenDrawerContext.Provider>
  );
}

export function OpenEntryDrawerButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const openDrawer = useContext(OpenDrawerContext);
  return (
    <button type="button" onClick={() => openDrawer?.()} className={className}>
      {children}
    </button>
  );
}
