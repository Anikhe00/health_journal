import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OpenEntryDrawerButton } from "@/components/EntryDrawer";
import HeaderNav from "@/components/HeaderNav";

export default async function Header() {
  const session = await getServerSession(authOptions);
  // Read the name from the database (not the login cookie) so the avatar updates after a profile change.
  const user = session ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } }) : null;
  const initial = (user?.name ?? session?.user?.name ?? "").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      {/* Phones: logo on the left, avatar on the right. Tablet and up: logo, links in the middle, New entry on the right. */}
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2 sm:grid sm:grid-cols-[1fr_auto_1fr]">
        <Link href={session ? "/dashboard" : "/login"} className="text-lg font-bold text-teal-800">
          PatientLog
        </Link>

        {session && (
          <>
            <Link
              href="/profile"
              aria-label="Your profile"
              className="flex size-9 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white hover:bg-teal-800 sm:hidden"
            >
              {initial}
            </Link>

            <HeaderNav />

            <div className="hidden justify-self-end sm:block">
              <OpenEntryDrawerButton className="btn-primary min-h-9! px-3.5! py-1.5! text-sm!">+ New entry</OpenEntryDrawerButton>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
