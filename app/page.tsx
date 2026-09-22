import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import { TimelineIcon } from "@/components/NavIcons";
import { ArchiveIcon, ShareIcon } from "@/components/ListRows";

// Signed-in visitors go straight to their timeline. Everyone else sees what the app is and how to start.
export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <LogoMark className="mx-auto size-14" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Your health journal, in your own hands</h1>
          <p className="mx-auto max-w-md text-slate-600">
            Hospital records in Nigeria don&apos;t follow you from one hospital to another. Health Journal lets you keep your own
            record of visits, results and prescriptions, and carry it with you.
          </p>
        </div>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
          <Link href="/signup" className="btn-primary">Create your journal</Link>
          <Link href="/login" className="btn-secondary">Log in</Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Feature icon={<TimelineIcon className="size-6 text-teal-700" />} title="A simple timeline" text="Write down visits, symptoms, lab results and prescriptions as they happen, with photos of the paperwork." />
        <Feature icon={<ShareIcon className="size-6 text-teal-700" />} title="Share with a clinician" text="Send a private link to the entries you choose, no account needed on their end, and turn it off whenever." />
        <Feature icon={<ArchiveIcon className="size-6 text-teal-700" />} title="Always yours to keep" text="Download your whole journal as a PDF or a ZIP file at any time." />
      </div>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card flex gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">{icon}</div>
      <div>
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}
