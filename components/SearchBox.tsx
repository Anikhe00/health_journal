"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Search box for the timeline. The results update by themselves shortly after the
// person stops typing, by putting the text in the URL (?q=...), which the page reads.
export default function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);

  useEffect(() => {
    const query = value.trim();
    if (query === urlQuery.trim()) return;

    const timer = setTimeout(() => {
      // Keep the tag filter, change only the search text.
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, urlQuery, searchParams, pathname, router]);

  return (
    // Still a real form, so pressing Enter works too (and it works without JavaScript).
    <form action={pathname} method="get" role="search">
      {searchParams.get("tag") && <input type="hidden" name="tag" value={searchParams.get("tag") ?? ""} />}
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search your entries"
        aria-label="Search your entries"
        autoComplete="off"
        className="input"
      />
    </form>
  );
}
