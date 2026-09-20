"use client";

import { createContext, Fragment, useCallback, useContext, useState } from "react";
import Drawer from "@/components/Drawer";

const OpenDrawerContext = createContext<() => void>(() => {});

type Props = {
  title: string; // the drawer's heading
  content: React.ReactNode; // what the drawer holds (usually a form)
  children: React.ReactNode; // the part of the page that can open it, using <OpenDrawerButton>
};

// One drawer that any number of buttons on the page can open.
// Each time it opens, its contents start fresh from the page's current data, so nothing stale is left over.
export function DrawerProvider({ title, content, children }: Props) {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(0);

  const openDrawer = useCallback(() => {
    setOpened((count) => count + 1);
    setOpen(true);
  }, []);
  const closeDrawer = useCallback(() => setOpen(false), []);

  return (
    <OpenDrawerContext.Provider value={openDrawer}>
      {children}
      <Drawer open={open} onClose={closeDrawer} title={title}>
        <Fragment key={opened}>{content}</Fragment>
      </Drawer>
    </OpenDrawerContext.Provider>
  );
}

export function OpenDrawerButton({ className, children }: { className: string; children: React.ReactNode }) {
  const openDrawer = useContext(OpenDrawerContext);
  return (
    <button type="button" onClick={openDrawer} className={className}>
      {children}
    </button>
  );
}
