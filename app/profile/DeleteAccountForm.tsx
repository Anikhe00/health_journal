"use client";

import { useActionState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount } from "@/app/profile/actions";
import DrawerFormLayout from "@/components/DrawerFormLayout";
import PasswordInput from "@/components/PasswordInput";

// The "Delete account" form. It asks for the password again before anything is deleted.
export default function DeleteAccountForm() {
  const [state, formAction, pending] = useActionState(deleteAccount, undefined);

  // The account is gone, so end the login too and go back to the login page.
  useEffect(() => {
    if (state?.deleted) signOut({ callbackUrl: "/login" });
  }, [state]);

  return (
    <DrawerFormLayout
      action={formAction}
      pending={pending || Boolean(state?.deleted)}
      error={state?.error}
      submitLabel="Delete my account"
      pendingLabel="Deleting…"
      danger
    >
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        <p className="font-semibold">This can&apos;t be undone.</p>
        <p className="mt-1">
          Your profile, every journal entry, all uploaded photos and your health passport will be deleted for good.
          A passport card you already printed will still show the details it was printed with, because they are stored inside its QR code.
        </p>
      </div>

      <div>
        <label htmlFor="password" className="label">Enter your password to confirm</label>
        <PasswordInput name="password" autoComplete="current-password" />
      </div>
    </DrawerFormLayout>
  );
}
