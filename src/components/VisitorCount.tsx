"use client";

import { useEffect, useState } from "react";
import {
  formatVisitorCount,
  VISITOR_STORAGE_KEY,
} from "@/lib/visitor";

export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      try {
        const hasVisited = localStorage.getItem(VISITOR_STORAGE_KEY);

        if (!hasVisited) {
          const postRes = await fetch("/api/visitors", { method: "POST" });

          if (postRes.ok) {
            const data = (await postRes.json()) as { count: number };
            localStorage.setItem(VISITOR_STORAGE_KEY, "1");
            if (!cancelled) {
              setCount(data.count);
            }
            return;
          }
        }

        const getRes = await fetch("/api/visitors");

        if (getRes.ok) {
          const data = (await getRes.json()) as { count: number };
          if (!cancelled) {
            setCount(data.count);
          }
        }
      } catch {
        // Keep footer quiet when the counter is unavailable.
      }
    }

    loadCount();

    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) {
    return <>—</>;
  }

  return <>{formatVisitorCount(count)}</>;
}
