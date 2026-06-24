"use client";

import { useEffect } from "react";

function getMermaidTheme(): "default" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "default";
}

export function MermaidHydrator() {
  useEffect(() => {
    let cancelled = false;

    async function renderDiagrams() {
      const blocks = document.querySelectorAll<HTMLElement>(
        ".post-content .mermaid-block[data-diagram]",
      );

      if (blocks.length === 0) {
        return;
      }

      const mermaid = (await import("mermaid")).default;

      mermaid.initialize({
        startOnLoad: false,
        theme: getMermaidTheme(),
        securityLevel: "loose",
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
      });

      for (const [index, block] of Array.from(blocks).entries()) {
        if (cancelled) {
          return;
        }

        const encoded = block.getAttribute("data-diagram");
        if (!encoded) {
          continue;
        }

        const source = decodeURIComponent(encoded);

        try {
          const id = `mermaid-diagram-${index}`;
          const { svg } = await mermaid.render(id, source);
          block.innerHTML = svg;
        } catch {
          block.innerHTML =
            '<p class="mermaid-error">Diagram could not be rendered.</p>';
        }
      }
    }

    void renderDiagrams();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
