"use client";

import { signOut } from "next-auth/react";
import { ChevronRight, LogoutIcon, rowClass } from "@/components/ListRows";

// A row in the profile page's list.
export default function SignOutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className={rowClass}>
      <LogoutIcon />
      <span className="flex-1">Sign out</span>
      <ChevronRight />
    </button>
  );
}
