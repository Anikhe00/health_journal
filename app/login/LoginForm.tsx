"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import PasswordInput from "@/components/PasswordInput";
import { useHydrated } from "@/lib/use-hydrated";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const hydrated = useHydrated();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });

    if (result?.error) {
      setError("That email or password isn't right. Please try again.");
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} method="post" className="space-y-4">
      {error && <p className="form-error" role="alert">{error}</p>}

      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="input" />
      </div>

      <div>
        <label htmlFor="password" className="label">Password</label>
        <PasswordInput name="password" autoComplete="current-password" />
      </div>

      <button type="submit" disabled={pending || !hydrated} className="btn-primary w-full">
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
