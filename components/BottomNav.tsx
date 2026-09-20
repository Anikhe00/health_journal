"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OpenEntryDrawerButton } from "@/components/EntryDrawer";
import { PassportIcon, PlusIcon, TimelineIcon } from "@/components/NavIcons";

// The navigation bar at the bottom of the screen on phones. Bigger screens use the header instead.
export default function BottomNav() {
  const pathname = usePathname();

  const tab = (active: boolean) =>
    `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-teal-700" : "text-slate-500"}`;

  return (
    <nav aria-label="Main" className="shrink-0 border-t border-slate-200 bg-white sm:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-3 items-center">
        <li>
          <Link
            href="/dashboard"
            aria-current={pathname.startsWith("/dashboard") || pathname.startsWith("/entries") ? "page" : undefined}
            className={tab(pathname.startsWith("/dashboard") || pathname.startsWith("/entries"))}
          >
            <TimelineIcon />
            Timeline
          </Link>
        </li>
        <li>
          <OpenEntryDrawerButton className="mx-auto flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium text-teal-800">
            <span className="flex size-9 items-center justify-center rounded-full bg-teal-700 text-white">
              <PlusIcon />
            </span>
            New entry
          </OpenEntryDrawerButton>
        </li>
        <li>
          <Link
            href="/passport"
            aria-current={pathname.startsWith("/passport") ? "page" : undefined}
            className={tab(pathname.startsWith("/passport"))}
          >
            <PassportIcon />
            Passport
          </Link>
        </li>
      </ul>
    </nav>
  );
}
