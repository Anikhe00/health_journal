"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ChevronRight, LogoutIcon, rowClass } from "@/components/ListRows";

// A row in the profile page's list.
export default function SignOutButton() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={rowClass}>
        <LogoutIcon />
        <span className="flex-1">Sign out</span>
        <ChevronRight />
      </button>

      <ConfirmDialog
        open={open}
        title="Sign out?"
        description="You'll need your email and password to sign back in."
        confirmLabel="Sign out"
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setPending(true);
          signOut({ callbackUrl: "/login" });
        }}
      />
    </>
  );
}
