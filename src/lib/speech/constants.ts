import type { SpeechRate } from "@/lib/speech/types";

export const ARTICLE_SELECTOR = "article.post-content";

export const SPEECH_RATES: readonly SpeechRate[] = [0.75, 1, 1.25, 1.5, 2] as const;

export const DEFAULT_SPEECH_RATE: SpeechRate = 1;

export const DEFAULT_SPEECH_VOLUME = 1;

export const DEFAULT_SPEECH_PITCH = 1;

export const HEADING_PAUSE_MS = 600;

export const LIST_ITEM_PAUSE_MS = 400;

export const MAX_UTTERANCE_CHARS = 8000;

export const CODE_BLOCK_PLACEHOLDER =
  "The following section contains example code.";

export const EQUATION_PLACEHOLDER =
  "The article now introduces an equation illustrating this concept.";

export const ELEMENTS_TO_REMOVE = [
  "img",
  "svg",
  "video",
  "iframe",
  "button",
  "nav",
  "table",
  "[hidden]",
  '[aria-hidden="true"]',
  ".post-table-scroll",
  ".mermaid-block",
] as const;

export const INLINE_ELEMENTS_TO_STRIP = [
  ".katex",
  ".katex-display",
  "code",
  "pre",
  "img",
  "svg",
  "button",
] as const;
