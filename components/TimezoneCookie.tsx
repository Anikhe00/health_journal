"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Remembers the visitor's timezone in a cookie, so the server can say "Good morning" and pick "today" correctly.
// The first time (or after travelling) it reloads the page data once, so it shows the right times straight away.
export default function TimezoneCookie() {
  const router = useRouter();

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) return;

    const encoded = encodeURIComponent(timeZone);
    const current = document.cookie.split("; ").find((cookie) => cookie.startsWith("tz="))?.slice(3);
    if (current === encoded) return;

    document.cookie = `tz=${encoded}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }, [router]);

  return null;
}
