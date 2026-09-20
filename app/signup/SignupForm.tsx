"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/app/signup/actions";
import PasswordInput from "@/components/PasswordInput";
import { useHydrated } from "@/lib/use-hydrated";

export default function SignupForm() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const hydrated = useHydrated();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const result = await registerUser({ name, email, password });
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    // Account created: log straight in. On success NextAuth redirects to the dashboard.
    const signInResult = await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
    if (signInResult?.error) {
      setError("Your account was created, but we couldn't log you in. Please try logging in.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} method="post" className="space-y-4">
      {error && <p className="form-error" role="alert">{error}</p>}

      <div>
        <label htmlFor="name" className="label">Your name</label>
        <input id="name" name="name" type="text" autoComplete="name" required className="input" />
      </div>

      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>

      <div>
        <label htmlFor="password" className="label">Password (at least 8 characters)</label>
        <PasswordInput name="password" autoComplete="new-password" minLength={8} />
      </div>

      <button type="submit" disabled={pending || !hydrated} className="btn-primary w-full">
        {pending ? "Creating account…" : "Create my account"}
      </button>
    </form>
  );
}
