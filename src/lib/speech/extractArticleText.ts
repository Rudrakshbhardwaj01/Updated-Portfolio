import {
  HEADING_PAUSE_MS,
  LIST_ITEM_PAUSE_MS,
} from "@/lib/speech/constants";
import { cleanArticle } from "@/lib/speech/cleanArticle";
import type { SpeechSegment } from "@/lib/speech/types";

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

function getReadableText(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement;

  clone
    .querySelectorAll(
      ".katex, .katex-display, code, pre, img, svg, button, table",
    )
    .forEach((node) => {
      node.remove();
    });

  return normalizeWhitespace(clone.textContent ?? "");
}

function appendSegment(
  segments: SpeechSegment[],
  text: string,
  options?: Pick<SpeechSegment, "pauseBeforeMs" | "pauseAfterMs">,
): void {
  const normalized = normalizeWhitespace(text);
  if (!normalized) {
    return;
  }

  segments.push({
    text: normalized,
    ...options,
  });
}

function processBlockElement(
  element: HTMLElement,
  segments: SpeechSegment[],
): void {
  const tag = element.tagName.toLowerCase();

  if (tag === "hr") {
    return;
  }

  if (/^h[1-6]$/.test(tag)) {
    appendSegment(segments, getReadableText(element), {
      pauseBeforeMs: HEADING_PAUSE_MS,
    });
    return;
  }

  if (tag === "ul" || tag === "ol") {
    const items = Array.from(element.children).filter(
      (child): child is HTMLElement => child.tagName.toLowerCase() === "li",
    );

    items.forEach((item, index) => {
      const itemText = getReadableText(item);
      if (!itemText) {
        return;
      }

      appendSegment(segments, itemText, {
        pauseAfterMs: index < items.length - 1 ? LIST_ITEM_PAUSE_MS : undefined,
      });
    });
    return;
  }

  if (tag === "p" || tag === "blockquote") {
    appendSegment(segments, getReadableText(element));
    return;
  }

  if (element.classList.contains("post-table-scroll")) {
    return;
  }

  if (element.children.length === 0) {
    appendSegment(segments, getReadableText(element));
    return;
  }

  Array.from(element.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      processBlockElement(child, segments);
    }
  });
}

export function extractSpeechSegments(article: HTMLElement): SpeechSegment[] {
  const cleaned = cleanArticle(article);
  const segments: SpeechSegment[] = [];

  Array.from(cleaned.children).forEach((child) => {
    if (child instanceof HTMLElement) {
      processBlockElement(child, segments);
    }
  });

  return segments;
}
