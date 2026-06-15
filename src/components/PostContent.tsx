import { marked } from "marked";
import { renderMathInMarkdown } from "@/lib/renderMath";

type PostContentProps = {
  content: string;
};

function wrapTables(html: string): string {
  return html
    .replace(/<table\b/g, '<div class="post-table-scroll"><table')
    .replace(/<\/table>/g, "</table></div>");
}

export function PostContent({ content }: PostContentProps) {
  const html = wrapTables(
    marked.parse(renderMathInMarkdown(content), { async: false }) as string,
  );

  return (
    <article
      className="post-content mt-8 text-[20px] leading-[1.9]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}