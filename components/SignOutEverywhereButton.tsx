"use client";

import { signOut } from "next-auth/react";
import { signOutEverywhere } from "@/app/profile/actions";
import { ChevronRight, DevicesIcon, rowClass } from "@/components/ListRows";

// A row in the profile page's list. Cancels every login of the account, including this one.
export default function SignOutEverywhereButton() {
  async function handleClick() {
    if (!window.confirm("Sign out on all your devices, including this one?")) return;
    await signOutEverywhere();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <button type="button" onClick={handleClick} className={rowClass}>
      <DevicesIcon />
      <span className="flex-1">Sign out on all devices</span>
      <ChevronRight />
    </button>
  );
}
