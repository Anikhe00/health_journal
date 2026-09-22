"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { signOutEverywhere } from "@/app/profile/actions";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ChevronRight, DevicesIcon, rowClass } from "@/components/ListRows";

// A row in the profile page's list. Cancels every login of the account, including this one.
export default function SignOutEverywhereButton() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    await signOutEverywhere();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={rowClass}>
        <DevicesIcon />
        <span className="flex-1">Sign out on all devices</span>
        <ChevronRight />
      </button>

      <ConfirmDialog
        open={open}
        title="Sign out everywhere?"
        description="Every device signed into this account, including this one, will be signed out."
        confirmLabel="Sign out everywhere"
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
