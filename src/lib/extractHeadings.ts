import { lexer, type Token, type Tokens } from "marked";

export type TocHeading = {
  id: string;
  text: string;
  level: 2;
};

const TOC_LEVELS = new Set([2]);

export function plainHeadingText(raw: string): string {
  return raw
    .replace(/\$\$[\s\S]+?\$\$/g, "")
    .replace(/\$([^$\n]+?)\$/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\*|_/g, "")
    .replace(/`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "section";
}

export function createSlugFactory() {
  const counts = new Map<string, number>();

  return (plain: string) => {
    const base = slugifyHeading(plain);
    const count = counts.get(base) ?? 0;

    counts.set(base, count + 1);

    return count === 0 ? base : `${base}-${count}`;
  };
}

function isHeadingToken(token: Token): token is Tokens.Heading {
  return token.type === "heading";
}

export function extractHeadings(markdown: string): TocHeading[] {
  const nextId = createSlugFactory();
  const headings: TocHeading[] = [];

  for (const token of lexer(markdown)) {
    if (!isHeadingToken(token) || !TOC_LEVELS.has(token.depth)) {
      continue;
    }

    const text = plainHeadingText(token.text);

    if (!text) {
      continue;
    }

    headings.push({
      id: nextId(text),
      text,
      level: 2,
    });
  }

  return headings;
}