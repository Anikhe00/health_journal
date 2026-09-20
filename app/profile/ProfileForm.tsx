"use client";

import { useActionState, useEffect, useState } from "react";
import { updateProfile } from "@/app/profile/actions";
import { useCloseDrawer } from "@/components/Drawer";
import DrawerFormLayout from "@/components/DrawerFormLayout";
import { EmergencyContactFields, HealthBasics, type HealthValues } from "@/components/HealthFields";

type Props = {
  today: string;
  initial: HealthValues & { name: string };
};

// The "Edit profile" form. It lives in a drawer and closes itself once saved.
export default function ProfileForm({ today, initial }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);
  const close = useCloseDrawer();
  const [values, setValues] = useState(initial);

  useEffect(() => {
    if (state?.saved) close();
  }, [state, close]);

  const set = (key: keyof typeof initial, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <DrawerFormLayout action={formAction} pending={pending} error={state?.error} submitLabel="Save profile" pendingLabel="Saving…">
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className="input"
        />
      </div>

      <HealthBasics values={values} onChange={set} today={today} />
      <EmergencyContactFields values={values} onChange={set} />
    </DrawerFormLayout>
  );
}
