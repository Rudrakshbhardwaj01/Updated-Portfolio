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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "&#34;")
    .replace(/'/g, "&#039;");
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

        const escapedText = escapeHtml(text);
        const langAttr = lang ? ` data-language="${lang}"` : "";
        return `<div class="code-block"${langAttr}><div class="code-block-header"><span class="code-block-language">${lang || ""}</span><button class="code-block-copy" type="button" aria-label="Copy code"><svg class="code-block-copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg><span class="code-block-copy-text">COPY</span></button></div><pre class="code-block-pre"><code class="${lang ? `language-${lang}` : ""}">${escapedText}</code></pre></div>\n`;
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