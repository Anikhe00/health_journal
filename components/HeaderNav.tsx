"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PassportIcon, TimelineIcon, UserIcon } from "@/components/NavIcons";
import { PASSPORT_ENABLED } from "@/lib/features";

// The links in the middle of the header on tablets and desktops. On phones the bottom bar does this job.
export default function HeaderNav() {
  const pathname = usePathname();

  const items: { href: string; label: string; active: boolean; icon: React.ReactNode }[] = [
    {
      href: "/dashboard",
      label: "Timeline",
      active: pathname.startsWith("/dashboard") || pathname.startsWith("/entries"),
      icon: <TimelineIcon className="size-5" />,
    },
    ...(PASSPORT_ENABLED
      ? [{ href: "/passport", label: "Passport", active: pathname.startsWith("/passport"), icon: <PassportIcon className="size-5" /> }]
      : []),
    {
      href: "/profile",
      label: "Profile",
      active: pathname.startsWith("/profile"),
      icon: <UserIcon className="size-5" />,
    },
  ];

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
            item.active ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
