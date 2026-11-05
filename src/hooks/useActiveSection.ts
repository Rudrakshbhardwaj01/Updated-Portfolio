"use client";

import { useCallback, useEffect, useState } from "react";
import type { TocHeading } from "@/lib/extractHeadings";

const SCROLL_OFFSET = 96;

/**
 * Single source of truth for the article section the reader is currently in.
 * Consumed by both the Contents (ArticleToc) navigation and the floating
 * ReadingProgressNavigator so the two can never disagree.
 */
export function useActiveSection(headings: TocHeading[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(
    headings[0]?.id ?? null,
  );

  const updateActiveHeading = useCallback(() => {
    let current = headings[0]?.id ?? null;

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element && element.getBoundingClientRect().top <= SCROLL_OFFSET) {
        current = heading.id;
      }
    }

    setActiveId(current);
  }, [headings]);

  useEffect(() => {
    updateActiveHeading();

    let frame = 0;
    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateActiveHeading();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", updateActiveHeading);

    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", updateActiveHeading);
    };
  }, [updateActiveHeading]);

  return activeId;
}
