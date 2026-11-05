"use client";

import { useCallback, useEffect, useRef } from "react";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useFloatingWidget } from "@/hooks/useFloatingWidget";
import type { TocHeading } from "@/lib/extractHeadings";

type ArticleTocProps = {
  headings: TocHeading[];
};

export function ArticleToc({ headings }: ArticleTocProps) {
  const { isOpen, toggle, close } = useFloatingWidget();
  const activeId = useActiveSection(headings);
  const panelRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    close();
    buttonRef.current?.focus();
  }, [close]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTarget =
      panelRef.current?.querySelector<HTMLElement>(".article-toc-close");
    focusTarget?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }

      handleClose();
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen, handleClose]);

  function scrollToHeading(id: string) {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    handleClose();
  }

  if (headings.length < 3) {
    return null;
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className={`article-toc-trigger${isOpen ? " article-toc-trigger--open" : ""}`}
        aria-expanded={isOpen}
        aria-controls="article-toc-panel"
        aria-label="Open table of contents"
      >
        <span className="article-toc-trigger-accent" aria-hidden="true" />
        <span className="article-toc-trigger-content">
          <span className="article-toc-trigger-title">Contents</span>
          <span className="article-toc-trigger-arrow" aria-hidden="true">
            {isOpen ? "×" : "≡"}
          </span>
        </span>
      </button>

      {isOpen ? (
        <nav
          ref={panelRef}
          id="article-toc-panel"
          aria-label="Table of contents"
          className="article-toc-panel"
        >
          <div className="article-toc-header">
            <p className="article-toc-title">Contents</p>
            <button
              type="button"
              onClick={handleClose}
              className="article-toc-close"
              aria-label="Close table of contents"
            >
              Close
            </button>
          </div>

          <ol className="article-toc-list">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={`article-toc-item article-toc-item--level-${heading.level}`}
              >
                <a
                  href={`#${heading.id}`}
                  className={activeId === heading.id ? "is-active" : undefined}
                  aria-current={activeId === heading.id ? "location" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToHeading(heading.id);
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
    </>
  );
}
