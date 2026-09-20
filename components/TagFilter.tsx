"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type Item = { label: string; href: string; active: boolean };

// The row of filter chips on the timeline.
// Phones: one row that scrolls sideways (the chips run to the edge of the screen). Tablet and up: chips wrap.
export default function TagFilter({ items }: { items: Item[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const activeLabel = items.find((item) => item.active)?.label;

  // Choosing a filter reloads the page, which would leave the row scrolled to the start.
  // Scroll it so the chosen chip is in view again.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !active) return;
    list.scrollTo({ left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2 });
  }, [activeLabel]);

  return (
    <ul
      ref={listRef}
      aria-label="Filter by type"
      className="no-scrollbar relative -mx-4 -my-1 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:my-0 sm:flex-wrap sm:overflow-visible sm:p-0"
    >
      {items.map((item) => (
        <li key={item.label} className="shrink-0">
          <Link
            href={item.href}
            aria-current={item.active ? "true" : undefined}
            className={`inline-block whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              item.active
                ? "border-teal-700 bg-teal-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
