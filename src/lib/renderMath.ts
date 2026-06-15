import katex from "katex";

function renderTex(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex.trim(), {
    displayMode,
    throwOnError: false,
    strict: "ignore",
  });
}

export function renderMathInMarkdown(content: string): string {
  const withBlockMath = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) =>
    renderTex(tex, true),
  );

  return withBlockMath.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, (_, tex) =>
    renderTex(tex, false),
  );
}
