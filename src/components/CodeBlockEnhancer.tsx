"use client";

import { useEffect } from "react";

export function CodeBlockEnhancer() {
  useEffect(() => {
    const codeBlocks = document.querySelectorAll(".code-block");

    codeBlocks.forEach((block) => {
      const copyButton = block.querySelector<HTMLButtonElement>(
        ".code-block-copy"
      );
      const codeElement = block.querySelector<HTMLPreElement>(
        ".code-block-pre code"
      );

      if (!copyButton || !codeElement) return;

      const copyText = copyButton.querySelector<HTMLElement>(".code-block-copy-text");
      const copyIcon = copyButton.querySelector<HTMLElement>(".code-block-copy-icon");
      const checkIcon = copyButton.querySelector<HTMLElement>(".code-block-copy-check");

      const handleCopy = async () => {
        const text = codeElement.textContent || "";
        try {
          await navigator.clipboard.writeText(text);
          copyButton.classList.add("copied");
          if (copyText) copyText.textContent = "COPIED";
          if (copyIcon) copyIcon.style.display = "none";
          if (checkIcon) checkIcon.style.display = "block";

          setTimeout(() => {
            copyButton.classList.remove("copied");
            if (copyText) copyText.textContent = "COPY";
            if (copyIcon) copyIcon.style.display = "block";
            if (checkIcon) checkIcon.style.display = "none";
          }, 2000);
        } catch {
          copyButton.classList.add("copied");
          if (copyText) copyText.textContent = "COPIED";
          setTimeout(() => {
            copyButton.classList.remove("copied");
            if (copyText) copyText.textContent = "COPY";
          }, 2000);
        }
      };

      copyButton.addEventListener("click", handleCopy);

      return () => {
        copyButton.removeEventListener("click", handleCopy);
      };
    });
  }, []);

  return null;
}