"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import type { PageContext } from "@/lib/bhardwajbot/prompt";

export function usePageContext(): PageContext {
  const pathname = usePathname();

  return useMemo(() => {
    if (pathname === "/") {
      return {
        pathname,
        pageType: "home",
        title: "Home",
      };
    }

    if (pathname === "/writings") {
      return {
        pathname,
        pageType: "writings-index",
        title: "Writings",
      };
    }

    const writingMatch = pathname.match(/^\/writings\/([^/]+)$/);

    if (writingMatch) {
      const slug = writingMatch[1];
      const title =
        typeof document !== "undefined"
          ? document.title.replace(/\s*\|\s*Rudraksh Bhardwaj.*$/, "").trim()
          : undefined;

      return {
        pathname,
        pageType: "writing",
        slug,
        title: title || slug,
      };
    }

    return {
      pathname,
      pageType: "other",
    };
  }, [pathname]);
}
