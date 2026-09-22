import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUserId, getSessionUser } from "@/lib/auth";
import { getTimeZone } from "@/lib/timezone";
import { formatLongDate, todayInputValue, toInputValue } from "@/lib/dates";
import DrawerButton from "@/components/DrawerButton";
import SignOutButton from "@/components/SignOutButton";
import SignOutEverywhereButton from "@/components/SignOutEverywhereButton";
import { ArchiveIcon, ChevronRight, PencilIcon, PrinterIcon, ShareIcon, TrashIcon, rowClass } from "@/components/ListRows";
import ProfileForm from "@/app/profile/ProfileForm";
import DeleteAccountForm from "@/app/profile/DeleteAccountForm";

export default async function ProfilePage() {
  await requireUserId(); // redirects if not signed in
  const user = await getSessionUser(); // same query requireUserId() already made, reused rather than repeated
  if (!user) notFound();

  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  const contact = user.emergencyContactPhone
    ? `${user.emergencyContactName ? `${user.emergencyContactName} · ` : ""}${user.emergencyContactPhone}`
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-teal-700 text-2xl font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{user.name}</h1>
          <p className="truncate text-sm text-slate-600">{user.email}</p>
        </div>
      </div>

      <dl className="card divide-y divide-slate-100 py-1! text-sm">
        <Detail label="Date of birth" value={user.dateOfBirth ? formatLongDate(user.dateOfBirth) : null} />
        <Detail label="Blood group" value={user.bloodGroup} />
        <Detail label="Genotype" value={user.genotype} />
        <Detail label="Emergency contact" value={contact} />
      </dl>

      <div className="card divide-y divide-slate-100 overflow-hidden p-0!">
        <Link href="/share" className={rowClass}>
          <ShareIcon />
          <span className="flex-1">Share with a clinician</span>
          <ChevronRight />
        </Link>
        {/* Plain links, not Next.js ones: these start file downloads. */}
        <a href="/api/export/pdf" download className={rowClass}>
          <PrinterIcon />
          <span className="flex-1">Download as PDF</span>
          <ChevronRight />
        </a>
        <a href="/api/export" download className={rowClass}>
          <ArchiveIcon />
          <span className="flex-1">Download everything (ZIP)</span>
          <ChevronRight />
        </a>
      </div>

      <div className="card divide-y divide-slate-100 overflow-hidden p-0!">
        <DrawerButton
          title="Edit profile"
          buttonClassName={rowClass}
          button={
            <>
              <PencilIcon />
              <span className="flex-1">Edit profile</span>
              <ChevronRight />
            </>
          }
        >
          <ProfileForm
            today={todayInputValue(await getTimeZone())}
            initial={{
              name: user.name,
              dateOfBirth: user.dateOfBirth ? toInputValue(user.dateOfBirth) : "",
              bloodGroup: user.bloodGroup ?? "",
              genotype: user.genotype ?? "",
              emergencyContactName: user.emergencyContactName ?? "",
              emergencyContactPhone: user.emergencyContactPhone ?? "",
            }}
          />
        </DrawerButton>

        <SignOutButton />
        <SignOutEverywhereButton />

        <DrawerButton
          title="Delete account"
          buttonClassName={`${rowClass} text-red-700`}
          button={
            <>
              <TrashIcon />
              <span className="flex-1">Delete account</span>
              <ChevronRight />
            </>
          }
        >
          <DeleteAccountForm />
        </DrawerButton>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className={`text-right font-medium ${value ? "text-slate-900" : "text-slate-400"}`}>{value ?? "Not added"}</dd>
    </div>
  );
}
