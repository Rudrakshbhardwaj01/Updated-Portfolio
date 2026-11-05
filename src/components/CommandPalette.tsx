"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { searchFinderItems, type FinderHighlight, type FinderItem } from "@/lib/finder";

type CommandPaletteProps = {
  items: FinderItem[];
};

const SEARCH_RESULT_LIMIT = 12;
/* With an empty query the finder doubles as a full site index; the small
   corpus (≈29 items) fits comfortably in the scrollable list. */
const SUGGESTION_LIMIT = 40;

function HighlightedTitle({
  title,
  highlight,
}: {
  title: string;
  highlight?: FinderHighlight;
}) {
  const valid =
    highlight &&
    highlight.start >= 0 &&
    highlight.end <= title.length &&
    highlight.start < highlight.end;

  if (!valid) {
    return <>{title}</>;
  }

  return (
    <>
      {title.slice(0, highlight.start)}
      <mark>{title.slice(highlight.start, highlight.end)}</mark>
      {title.slice(highlight.end)}
    </>
  );
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [triggerHidden, setTriggerHidden] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmedQuery = query.trim();
  const results = useMemo(
    () =>
      searchFinderItems(
        items,
        query,
        trimmedQuery ? SEARCH_RESULT_LIMIT : SUGGESTION_LIMIT,
      ),
    [items, query, trimmedQuery],
  );

  const flatItems = useMemo(
    () => results.groups.flatMap((group) => group.items),
    [results],
  );
  const indexById = useMemo(
    () => new Map(flatItems.map((item, index) => [item.id, index])),
    [flatItems],
  );

  const activeItem = flatItems[activeIndex];
  const activeOptionId = activeItem ? `finder-option-${activeItem.id}` : undefined;

  const close = useCallback(() => setOpen(false), []);

  /* Platform hint — set after mount so SSR and the first client render match. */
  useEffect(() => {
    setIsMac(/mac|iphone|ipad|ipod/i.test(navigator.platform || ""));
  }, []);

  /*
   * Scroll-aware trigger visibility: visible only at the top of the page.
   * The handler body is a single scrollY comparison with no layout work, so
   * it runs synchronously in the passive listener — cheaper and more
   * deterministic than scheduling rAF — and React re-renders only when the
   * 24px threshold is actually crossed. The Ctrl/Cmd+K shortcut is
   * registered separately and keeps working at any scroll position.
   */
  useEffect(() => {
    const THRESHOLD_PX = 24;
    let hidden = false;

    const update = () => {
      const next = window.scrollY > THRESHOLD_PX;
      if (next !== hidden) {
        hidden = next;
        setTriggerHidden(next);
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
    };
  }, []);

  /*
   * The trigger sits at the top-right, immediately left of whichever element
   * occupies that corner: the resume ribbon on most routes, the article TOC
   * trigger on article pages, or nothing at all (short articles hide both —
   * the finder then takes the corner itself). Measured rather than hardcoded
   * so label/viewport changes cannot cause overlap. Occupant width can drift
   * after mount (web-font swaps, late layout), so measurement is layered:
   * a settle loop while layout stabilises, then resize / font-load / window
   * load events, a ResizeObserver on the occupant, and a body mutation
   * observer for route transitions that swap the occupants.
   */
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const TOP_RIGHT_GAP = 12;
    const findSibling = () =>
      document.querySelector<HTMLElement>(".resume-btn") ??
      document.querySelector<HTMLElement>(".article-toc-trigger");

    let observer: ResizeObserver | null = null;
    let observedSibling: Element | null = null;
    let settleFrame = 0;

    const position = () => {
      const sibling = findSibling();
      if (!sibling) {
        trigger.style.right = "1rem";
        trigger.style.top = "1rem";
        return;
      }
      // Fixed-position offsets and getBoundingClientRect() share the layout
      // viewport, which EXCLUDES the scrollbar — clientWidth, not innerWidth,
      // or the scrollbar width leaks in as positioning error.
      const viewportWidth = document.documentElement.clientWidth;
      const rect = sibling.getBoundingClientRect();
      trigger.style.right = `${Math.round(
        viewportWidth - rect.left + TOP_RIGHT_GAP,
      )}px`;
      trigger.style.top = `${Math.round(rect.top)}px`;
    };

    const sync = () => {
      const sibling = findSibling();
      if (sibling !== observedSibling) {
        observer?.disconnect();
        observer = null;
        observedSibling = sibling;
        if (sibling) {
          observer = new ResizeObserver(position);
          observer.observe(sibling);
        }
      }
      position();
    };

    const settle = () => {
      cancelAnimationFrame(settleFrame);
      let lastRight = "";
      let stableFrames = 0;
      const tick = () => {
        position();
        const right = trigger.style.right;
        stableFrames = right === lastRight ? stableFrames + 1 : 0;
        lastRight = right;
        if (stableFrames < 30) settleFrame = requestAnimationFrame(tick);
      };
      settleFrame = requestAnimationFrame(tick);
    };

    sync();
    settle();
    window.addEventListener("resize", position);
    window.addEventListener("load", position);
    document.fonts?.ready.then(settle).catch(() => {});

    const mutations = new MutationObserver(sync);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(settleFrame);
      window.removeEventListener("resize", position);
      window.removeEventListener("load", position);
      mutations.disconnect();
      observer?.disconnect();
    };
  }, []);

  /* Global Ctrl/Cmd + K shortcut. Registered exactly once. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.isComposing || event.keyCode === 229) return;

      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        event.stopPropagation();
        setOpen((previous) => !previous);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Open/close lifecycle: reset state, lock scroll, manage focus. */
  useEffect(() => {
    if (!open) return;

    setQuery("");
    setActiveIndex(0);
    setEmailCopied(false);
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const frame = requestAnimationFrame(() => inputRef.current?.focus());

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  /* New query → selection back to the top result. */
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  /* Keep the selected option visible while arrowing through results. */
  useEffect(() => {
    if (!open || !activeOptionId) return;
    document
      .getElementById(activeOptionId)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, activeOptionId, open]);

  /* Clear any pending "email copied" timer on unmount. */
  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const activate = useCallback(
    (item: FinderItem) => {
      if (item.action) {
        switch (item.action) {
          case "toggle-theme":
            toggleTheme();
            close();
            return;

          case "open-terminal": {
            const terminalWindow = document.getElementById("rbsh-window");
            if (!terminalWindow) {
              document
                .querySelector<HTMLButtonElement>(
                  '[aria-label="Open RBSH terminal"]',
                )
                ?.click();
            }
            close();
            return;
          }

          case "open-bot": {
            const botPanel = document.querySelector('[aria-label="BhardwajBot"]');
            if (!botPanel) {
              document
                .querySelector<HTMLButtonElement>(
                  '[aria-label="Open BhardwajBot"]',
                )
                ?.click();
            }
            close();
            return;
          }

          case "copy-email": {
            const email = item.value;
            if (email && typeof navigator.clipboard?.writeText === "function") {
              navigator.clipboard
                .writeText(email)
                .then(() => {
                  setEmailCopied(true);
                  if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
                  copyTimerRef.current = setTimeout(
                    () => setEmailCopied(false),
                    1800,
                  );
                })
                .catch(() => {
                  // Clipboard unavailable (permissions/insecure context):
                  // keep the dialog open; the email is visible as the
                  // item description.
                });
            }
            return;
          }
        }
      }

      if (!item.href) return;

      if (item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
        close();
        return;
      }

      close();
      router.push(item.href);
    },
    [close, router, toggleTheme],
  );

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flatItems.length > 0) {
        setActiveIndex((previous) => (previous + 1) % flatItems.length);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flatItems.length > 0) {
        setActiveIndex(
          (previous) => (previous - 1 + flatItems.length) % flatItems.length,
        );
      }
      return;
    }

    if (event.key === "Home" && flatItems.length > 0) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === "End" && flatItems.length > 0) {
      event.preventDefault();
      setActiveIndex(flatItems.length - 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeItem) activate(activeItem);
      return;
    }

    if (event.key === "Tab") {
      // Minimal focus trap: cycle among the input and the dialog buttons.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        "input, button",
      );
      if (!focusables || focusables.length === 0) return;

      const list = Array.from(focusables);
      const current = list.indexOf(
        document.activeElement as HTMLElement,
      );
      event.preventDefault();

      const next = event.shiftKey
        ? current <= 0
          ? list.length - 1
          : current - 1
        : current === list.length - 1
          ? 0
          : current + 1;

      list[next]?.focus();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`finder-trigger${triggerHidden ? " finder-trigger--hidden" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open search"
        onClick={() => setOpen(true)}
      >
        {/* Static 1 KB SVG asset — next/image adds nothing for a tiny
            unoptimized icon. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="finder-trigger-icon"
          src="/assets/magnifying-glass.svg"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
        <span className="finder-trigger-label">Find</span>
        <kbd className="finder-trigger-kbd" aria-hidden="true">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {open ? (
        <div
          className="finder-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            className="finder-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Finder"
            onKeyDown={onDialogKeyDown}
          >
            <div className="finder-input-row">
              <input
                ref={inputRef}
                className="finder-input"
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="finder-results"
                aria-activedescendant={activeOptionId}
                aria-autocomplete="list"
                aria-label="Search the portfolio"
                placeholder="Search writings, projects, pages…"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                type="button"
                className="finder-close"
                aria-label="Close finder"
                onClick={close}
              >
                ×
              </button>
            </div>

            <div
              id="finder-results"
              className="finder-results"
              role="listbox"
              aria-label={trimmedQuery ? "Search results" : "Suggestions"}
            >
              {flatItems.length === 0 ? (
                <div className="finder-empty">
                  <p className="finder-empty-title">No results</p>
                  <p className="finder-empty-hint">
                    Try “attention”, “rag”, “resume”, or “theme”.
                  </p>
                </div>
              ) : (
                results.groups.map((group) => (
                  <div key={group.label} className="finder-group">
                    <p className="finder-group-label" aria-hidden="true">
                      {group.label}
                    </p>
                    {group.items.map((item) => {
                      const index = indexById.get(item.id) ?? 0;
                      const selected = index === activeIndex;

                      return (
                        <div
                          key={item.id}
                          id={`finder-option-${item.id}`}
                          role="option"
                          aria-selected={selected}
                          className={`finder-option${selected ? " finder-option-selected" : ""}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseMove={() => setActiveIndex(index)}
                          onClick={() => activate(item)}
                        >
                          <span className="finder-option-text">
                            <span className="finder-option-title">
                              <HighlightedTitle
                                title={item.title}
                                highlight={group.highlights.get(item.id)}
                              />
                            </span>
                            {item.description ? (
                              <span className="finder-option-desc">
                                {item.description}
                              </span>
                            ) : null}
                          </span>
                          {item.meta ? (
                            <span className="finder-option-meta">
                              {item.meta}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="finder-status">
              <span className="finder-status-hints" aria-hidden="true">
                ↑↓ navigate · ↵ open · esc close
              </span>
              <span className="finder-status-right">
                {emailCopied ? <span>Email copied ✓</span> : null}
                {trimmedQuery ? (
                  <button
                    type="button"
                    className="finder-clear"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                  >
                    Clear
                  </button>
                ) : null}
                <span aria-live="polite">
                  {results.total} result{results.total === 1 ? "" : "s"}
                </span>
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
