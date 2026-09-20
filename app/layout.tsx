import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";
import { authOptions } from "@/lib/auth";
import { todayInputValue } from "@/lib/dates";
import { getTimeZone } from "@/lib/timezone";
import { createEntry } from "@/app/entries/actions";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import TimezoneCookie from "@/components/TimezoneCookie";
import { EntryDrawerProvider } from "@/components/EntryDrawer";
import DisclaimerFooter from "@/components/DisclaimerFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PatientLog",
  description: "A personal health journal that you own and carry with you.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getServerSession(authOptions);
  const timeZone = await getTimeZone();

  // The header and footer stay in place; only the middle scrolls (#app-scroll).
  // #app-shell is everything the entry drawer covers: it is made inert while the drawer is open.
  const appShell = (
    <div id="app-shell" className="flex h-full flex-col">
      <Header />
      <div id="app-scroll" className="flex-1 overflow-y-auto">
        <main className="mx-auto min-h-full w-full max-w-2xl px-4 py-6 has-[[data-fill-height]]:h-full has-[[data-fill-height]]:pb-0">{children}</main>
      </div>
      <DisclaimerFooter />
      {session && <BottomNav />}
    </div>
  );

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-dvh overflow-hidden">
        {session ? (
          // One "new entry" drawer for the whole app, opened from the header, the bottom bar or a page.
          <EntryDrawerProvider
            title="New entry"
            action={createEntry}
            initial={{ date: todayInputValue(timeZone), title: "", body: "", tags: [] }}
            submitLabel="Save entry"
          >
            {appShell}
          </EntryDrawerProvider>
        ) : (
          appShell
        )}
        <TimezoneCookie />
      </body>
    </html>
  );
}
