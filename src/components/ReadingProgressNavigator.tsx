"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useActiveSection } from "@/hooks/useActiveSection";
import type { TocHeading } from "@/lib/extractHeadings";

type ReadingProgressNavigatorProps = {
  headings: TocHeading[];
};

const RING_SIZE = 20;
const RING_STROKE = 2;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
// Reader must scroll this far past the article top before the navigator appears.
const ENTRANCE_OFFSET = 240;

export function ReadingProgressNavigator({
  headings,
}: ReadingProgressNavigatorProps) {
  const activeId = useActiveSection(headings);
  const [progress, setProgress] = useState(0);
  const [inArticle, setInArticle] = useState(false);
  const [footerIntersecting, setFooterIntersecting] = useState(false);
  const frameRef = useRef(0);

  const activeHeading = useMemo(
    () => headings.find((heading) => heading.id === activeId) ?? null,
    [headings, activeId],
  );

  useEffect(() => {
    const article = document.querySelector<HTMLElement>("article.post-content");
    if (!article) {
      return;
    }

    const update = () => {
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      const ratio = total > 0 ? scrolled / total : 1;

      setProgress(Math.min(Math.max(ratio, 0), 1));
      setInArticle(-rect.top > ENTRANCE_OFFSET);
    };

    const scheduleUpdate = () => {
      if (frameRef.current) {
        return;
      }
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    // Re-measure when async content (images, fonts, code blocks, embeds)
    // changes the article's dimensions.
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(article);
    resizeObserver.observe(document.body);

    // Hide the navigator as soon as the page footer enters the viewport so it
    // never overlaps the footer or its decorative bottom image.
    const footer = document.querySelector("footer");
    const footerObserver = new IntersectionObserver(
      (entries) => {
        setFooterIntersecting(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: 0 },
    );
    if (footer) {
      footerObserver.observe(footer);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  const visible = inArticle && !footerIntersecting;

  const percent = Math.round(progress * 100);
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <div
      className={`reading-progress${visible ? " reading-progress--visible" : ""}`}
      role="progressbar"
      aria-label={`Reading progress: ${percent}%`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`${percent} percent read${activeHeading ? `, section: ${activeHeading.text}` : ""}`}
    >
      <span className="reading-progress-accent" aria-hidden="true" />
      <svg
        className="reading-progress-ring"
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="reading-progress-ring-track"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          strokeWidth={RING_STROKE}
          fill="none"
        />
        <circle
          className="reading-progress-ring-arc"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          strokeWidth={RING_STROKE}
          fill="none"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </svg>

      <span
        key={activeHeading?.id ?? "top"}
        className="reading-progress-section"
        aria-live="off"
      >
        {activeHeading ? activeHeading.text : "Top of article"}
      </span>
    </div>
  );
}
