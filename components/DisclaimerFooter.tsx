"use client";

import { usePathname } from "next/navigation";
import { DISCLAIMER_TEXT } from "@/components/Disclaimer";

// The disclaimer bar at the bottom of the screen. Every page has it except the health passport page.
export default function DisclaimerFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/passport")) return null;

  return (
    <footer className="shrink-0 border-t border-slate-200 bg-white">
      <p className="mx-auto max-w-2xl px-4 py-2 text-center text-[11px] leading-snug text-slate-500 sm:py-3 sm:text-xs">
        {DISCLAIMER_TEXT}
      </p>
    </footer>
  );
}
