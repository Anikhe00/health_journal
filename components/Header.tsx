import Link from "next/link";
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { OpenEntryDrawerButton } from "@/components/EntryDrawer";
import HeaderNav from "@/components/HeaderNav";
import Logo from "@/components/Logo";

// The logo renders instantly on every page. Everything that depends on who is signed in (the avatar,
// the nav links, "+ New entry") sits behind its own Suspense boundary, so a slow database never
// blocks the header itself — only that one part shows a placeholder while it loads.
export default function Header() {
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      {/* Phones: logo on the left, avatar on the right. Tablet and up: logo, links in the middle, New entry on the right. */}
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2 sm:grid sm:grid-cols-[1fr_auto_1fr]">
        {/* "/" redirects signed-in visitors to /dashboard itself, so the logo doesn't need to know who's signed in. */}
        <Link href="/" className="whitespace-nowrap text-lg font-bold text-teal-800">
          <Logo markClassName="size-6" />
        </Link>

        <Suspense fallback={<HeaderRightSkeleton />}>
          <HeaderRight />
        </Suspense>
      </div>
    </header>
  );
}

async function HeaderRight() {
  const user = await getSessionUser();
  if (!user) return null;

  const initial = user.name.trim().charAt(0).toUpperCase() || "?";

  return (
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
  );
}

// A stand-in for the avatar, nav links and "New entry" button while HeaderRight loads. On a page
// nobody is signed in on (login, signup, the landing page) this never actually appears, because
// getSessionUser() returns null without a database call, so HeaderRight resolves immediately.
function HeaderRightSkeleton() {
  return (
    <>
      <div className="size-9 shrink-0 animate-pulse rounded-full bg-slate-200 sm:hidden" />
      <div className="hidden items-center gap-1 sm:flex">
        <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="hidden h-9 w-28 animate-pulse justify-self-end rounded-lg bg-slate-100 sm:block" />
    </>
  );
}
