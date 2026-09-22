import Link from "next/link";
import SignupForm from "@/app/signup/SignupForm";

export default function SignupPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create your Health Journal</h1>
        <p className="mt-1 text-slate-600">Keep your own health notes in one place, and take them with you to any hospital.</p>
      </div>

      <SignupForm />

      <p className="text-center text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-700 underline">Log in</Link>
      </p>
    </div>
  );
}
