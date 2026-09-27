"use client";

import { useState } from "react";

export function CodeBlock({
  children,
  language,
}: {
  children: React.ReactNode;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const codeElement = document.querySelector(
      `[data-code-block-id="${blockId}"] code`
    );
    if (!codeElement) return;

    const text = codeElement.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const blockId = `code-block-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className="code-block" data-code-block-id={blockId}>
      <div className="code-block-header">
        {language && <span className="code-block-language">{language}</span>}
        <button
          className="code-block-copy"
          onClick={copyToClipboard}
          aria-label="Copy code"
          type="button"
        >
          {copied ? (
            <svg
              className="code-block-copy-check"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              className="code-block-copy-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          <span className="code-block-copy-text">
            {copied ? "COPIED" : "COPY"}
          </span>
        </button>
      </div>
      <pre className="code-block-pre">
        <code className={language ? `language-${language}` : ""}>
          {children}
        </code>
      </pre>
    </div>
  );
}