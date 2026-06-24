import { Marked, type Tokens } from "marked";
import { extractHeadings, type TocHeading } from "@/lib/extractHeadings";
import {
  protectMathInMarkdown,
  restoreMathInHtml,
} from "@/lib/renderMath";

export type PreparedPostContent = {
  html: string;
  headings: TocHeading[];
};

function wrapTables(html: string): string {
  return html
    .replace(/<table\b/g, '<div class="post-table-scroll"><table')
    .replace(/<\/table>/g, "</table></div>");
}

export function preparePostContent(content: string): PreparedPostContent {
  const headings = extractHeadings(content);
  const { markdown, blocks } = protectMathInMarkdown(content);

  let headingIndex = 0;

  const marked = new Marked({
    renderer: {
      heading(
        this: {
          parser: {
            parseInline: (
              tokens: Tokens.Heading["tokens"]
            ) => string;
          };
        },
        { tokens, depth }: Tokens.Heading,
      ) {
        const html = this.parser.parseInline(tokens);

        // Only H2 headings participate in the TOC.
        if (depth === 2) {
          const id = headings[headingIndex]?.id;
          headingIndex += 1;

          if (id) {
            return `<h2 id="${id}">${html}</h2>`;
          }
        }

        return `<h${depth}>${html}</h${depth}>`;
      },
      code({ text, lang }: Tokens.Code) {
        if (lang === "mermaid") {
          const encoded = encodeURIComponent(text.trim());
          return `<div class="mermaid-block" data-diagram="${encoded}"></div>\n`;
        }

        return false;
      },
    },
  });

  const html = restoreMathInHtml(
    wrapTables(marked.parse(markdown, { async: false }) as string),
    blocks,
  );

  return {
    html,
    headings,
  };
}