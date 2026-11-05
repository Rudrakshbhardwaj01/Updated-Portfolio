/**
 * Pure search engine for the universal Command-K finder.
 *
 * No React, no DOM, no I/O — the item index is built on the server
 * (see src/app/layout.tsx) and scoring happens client-side over a corpus
 * of roughly forty items, which needs no index structure or debounce.
 *
 * Matching, in priority order:
 *   1. Case-insensitive substring match on the title (extra weight when the
 *      match starts the title or a word inside it).
 *   2. Substring match on the description, then on keywords
 *      (category, tech stack, labels).
 *   3. Typo tolerance: a title word within Levenshtein distance 1–2 of the
 *      token (tokens of 4+ characters only).
 *   4. Subsequence match of the token inside the title (e.g. "atention"
 *      finds "attention").
 *
 * Multi-token queries are AND-semantics: every token must match somewhere,
 * and per-token scores are summed so title hits dominate.
 */

export type FinderItemAction =
  | "toggle-theme"
  | "open-terminal"
  | "open-bot"
  | "copy-email";

export type FinderGroupLabel = "Pages" | "Writings" | "Projects" | "Actions";

export type FinderItem = {
  id: string;
  group: FinderGroupLabel;
  title: string;
  description?: string;
  /** Extra searchable text: categories, tech stacks, labels. Never displayed. */
  keywords?: string;
  /** Internal root-relative path or absolute https URL. */
  href?: string;
  external?: boolean;
  action?: FinderItemAction;
  /** Payload for actions that need one (e.g. the email address to copy). */
  value?: string;
  /** Short right-aligned metadata shown on the result row (e.g. "GitHub"). */
  meta?: string;
};

export type FinderHighlight = { start: number; end: number };

export type FinderGroup = {
  label: FinderGroupLabel;
  items: FinderItem[];
  /** Highlight range (in item.title) for items matched by title. */
  highlights: Map<string, FinderHighlight>;
};

export type FinderResults = {
  groups: FinderGroup[];
  total: number;
};

const GROUP_ORDER: FinderGroupLabel[] = [
  "Pages",
  "Writings",
  "Projects",
  "Actions",
];

const WORD_SPLIT = /[^a-z0-9]+/;

/** True when `a` can become `b` with at most `max` single-character edits. */
function levenshteinWithin(a: string, b: string, max: number): boolean {
  if (a === b) return true;
  const lenA = a.length;
  const lenB = b.length;
  if (Math.abs(lenA - lenB) > max) return false;

  let previous = Array.from({ length: lenB + 1 }, (_, i) => i);

  for (let i = 1; i <= lenA; i++) {
    const current = [i];
    let rowMin = current[0];

    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        current[j - 1]! + 1,
        previous[j]! + 1,
        previous[j - 1]! + cost,
      );
      current.push(value);
      if (value < rowMin) rowMin = value;
    }

    // Whole row already exceeds the budget — no path can recover.
    if (rowMin > max) return false;
    previous = current;
  }

  return previous[lenB]! <= max;
}

/** True when every character of `token` appears in `title` in order. */
function isSubsequence(token: string, title: string): boolean {
  let cursor = 0;
  for (let i = 0; i < title.length && cursor < token.length; i++) {
    if (title[i] === token[cursor]) cursor++;
  }
  return cursor === token.length;
}

type TokenMatch = { score: number; highlight: FinderHighlight | null };

function scoreToken(item: FinderItem, rawToken: string): TokenMatch | null {
  const token = rawToken.toLowerCase();
  if (!token) return null;

  const title = item.title.toLowerCase();
  const description = (item.description ?? "").toLowerCase();
  const keywords = (item.keywords ?? "").toLowerCase();

  let score = 0;
  let highlight: FinderHighlight | null = null;

  const index = title.indexOf(token);
  if (index === 0) {
    score = 120;
    highlight = { start: 0, end: token.length };
  } else if (index > 0) {
    // Word boundary = the preceding character is not a letter or digit.
    const atWordBoundary = !/[a-z0-9]/.test(title[index - 1] ?? "");
    score = atWordBoundary ? 100 : 80;
    highlight = { start: index, end: index + token.length };
  }

  if (score === 0 && description.includes(token)) score = 60;
  if (score === 0 && keywords.includes(token)) score = 50;

  if (score === 0 && token.length >= 4) {
    const tolerance = token.length > 5 ? 2 : 1;
    const words = title.split(WORD_SPLIT).filter(Boolean);

    for (const word of words) {
      if (Math.abs(word.length - token.length) > tolerance) continue;
      if (levenshteinWithin(word, token, tolerance)) {
        score = 45;
        break;
      }
    }

    if (score === 0 && isSubsequence(token, title)) score = 30;
  }

  return score > 0 ? { score, highlight } : null;
}

function groupItems(
  items: FinderItem[],
  highlights: Map<string, FinderHighlight>,
): FinderResults {
  const groups: FinderGroup[] = [];

  for (const label of GROUP_ORDER) {
    const group = items.filter((item) => item.group === label);
    if (group.length === 0) continue;
    groups.push({ label, items: group, highlights });
  }

  return { groups, total: items.length };
}

/**
 * Search (or, for an empty query, rank-preserving suggestion listing).
 * Returns up to `limit` items grouped by category in stable group order.
 */
export function searchFinderItems(
  items: FinderItem[],
  query: string,
  limit = 12,
): FinderResults {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return groupItems(items.slice(0, limit), new Map());
  }

  type Scored = { item: FinderItem; score: number; highlight: FinderHighlight | null };
  const scored: Scored[] = [];

  for (const item of items) {
    let total = 0;
    let highlight: FinderHighlight | null = null;
    let matchedAll = true;

    for (const token of tokens) {
      const match = scoreToken(item, token);
      if (!match) {
        matchedAll = false;
        break;
      }
      total += match.score;
      if (!highlight && match.highlight) highlight = match.highlight;
    }

    if (matchedAll) scored.push({ item, score: total, highlight });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      GROUP_ORDER.indexOf(a.item.group) - GROUP_ORDER.indexOf(b.item.group) ||
      a.item.title.localeCompare(b.item.title),
  );

  const top = scored.slice(0, limit);
  const highlightMap = new Map<string, FinderHighlight>();
  for (const entry of top) {
    if (entry.highlight) highlightMap.set(entry.item.id, entry.highlight);
  }

  return groupItems(
    top.map((entry) => entry.item),
    highlightMap,
  );
}
