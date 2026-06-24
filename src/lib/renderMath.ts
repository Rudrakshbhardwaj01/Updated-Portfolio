import katex from "katex";

export type ProtectedMath = {
  markdown: string;
  blocks: string[];
};

function renderTex(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex.trim(), {
    displayMode,
    throwOnError: false,
    strict: "ignore",
  });
}

/**
 * Replace LaTeX delimiters with HTML comments that `marked` leaves untouched.
 * KaTeX HTML is injected only after markdown parsing so list/paragraph rules
 * cannot corrupt span attributes or MathML.
 */
export function protectMathInMarkdown(content: string): ProtectedMath {
  const blocks: string[] = [];

  const stash = (tex: string, displayMode: boolean): string => {
    const index = blocks.length;
    blocks.push(renderTex(tex, displayMode));
    return `<!--KATEX_${index}-->`;
  };

  const withBlockMath = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) =>
    `\n\n${stash(tex, true)}\n\n`,
  );

  const markdown = withBlockMath.replace(
    /(?<!\$)\$([^$\n]+?)\$(?!\$)/g,
    (_, tex) => stash(tex, false),
  );

  return { markdown, blocks };
}

export function restoreMathInHtml(html: string, blocks: string[]): string {
  return html.replace(/<!--KATEX_(\d+)-->/g, (_, rawIndex) => {
    const index = Number(rawIndex);
    return blocks[index] ?? "";
  });
}
