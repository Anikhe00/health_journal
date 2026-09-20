"use client";

import { useState } from "react";

type Props = {
  name: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
};

// A password box with a "Show password" checkbox, which helps people type on a phone.
export default function PasswordInput({ name, autoComplete, minLength }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <input
        id={name}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className="input"
      />
      <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
          className="size-4 accent-teal-700"
        />
        Show password
      </label>
    </div>
  );
}
