import Link from "next/link";
import LoginForm from "@/app/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-slate-600">Log in to see your health journal.</p>
      </div>

      <div className="card">
        <LoginForm />
      </div>

      <p className="text-center text-slate-600">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-teal-700 underline">Create an account</Link>
      </p>
    </div>
  );
}
