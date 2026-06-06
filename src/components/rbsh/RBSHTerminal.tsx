"use client";

import {
  ClipboardEvent,
  CompositionEvent,
  KeyboardEvent,
  useEffect,
  useRef,
} from "react";
import type { OutputLine, TerminalLine } from "@/lib/rbsh/types";
import { RBSHWelcome } from "./RBSHWelcome";

type RBSHTerminalProps = {
  lines: TerminalLine[];
  buffer: string;
  cursor: number;
  prompt: string;
  showWelcome: boolean;
  onSubmit: (buffer: string) => void;
  onShortcut: (command: string) => void;
  onKey: (
    key: string,
    modifiers: { ctrl: boolean; meta: boolean },
  ) => boolean;
  onInsert: (value: string) => void;
};

function ShellLink({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  const isExternal =
    href.startsWith("http") || href.startsWith("mailto:");

  return (
    <a
      href={href}
      className="rbsh-shell-link"
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      [ {label} ]
    </a>
  );
}

function OutputLineView({ line }: { line: OutputLine }) {
  return (
    <span className="block whitespace-pre-wrap">
      {line.map((part, index) => {
        if (part.kind === "link") {
          return (
            <ShellLink
              key={`link-${index}`}
              label={part.label}
              href={part.href}
            />
          );
        }

        return <span key={`text-${index}`}>{part.value}</span>;
      })}
    </span>
  );
}

function SessionOutput({ line }: { line: TerminalLine }) {
  const className =
    line.kind === "error"
      ? "rbsh-output-block rbsh-output-error"
      : "rbsh-output-block";

  if (line.error) {
    return (
      <div className={className}>
        {line.error.map((segment, index) => (
          <span key={`${line.id}-err-${index}`} className="block whitespace-pre-wrap">
            {segment}
          </span>
        ))}
      </div>
    );
  }

  if (!line.output) {
    return null;
  }

  return (
    <div className={className}>
      {line.output.lines.map((outputLine, index) => (
        <OutputLineView key={`${line.id}-out-${index}`} line={outputLine} />
      ))}
    </div>
  );
}

function CommandLine({ prompt, command }: { prompt: string; command: string }) {
  return (
    <div className="rbsh-session-line">
      <span className="rbsh-prompt">{prompt}</span>
      <span className="rbsh-command">{command}</span>
    </div>
  );
}

function TerminalInputLine({
  prompt,
  buffer,
  cursor,
  inputRef,
  onKeyDown,
  onPaste,
  onCompositionStart,
  onCompositionEnd,
  onFocusArea,
}: {
  prompt: string;
  buffer: string;
  cursor: number;
  inputRef: React.RefObject<HTMLDivElement | null>;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLDivElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (event: CompositionEvent<HTMLDivElement>) => void;
  onFocusArea: () => void;
}) {
  const beforeCursor = buffer.slice(0, cursor);
  const cursorChar = buffer[cursor] ?? "";
  const afterCursor = buffer.slice(cursor + 1);

  return (
    <div
      ref={inputRef}
      tabIndex={0}
      role="textbox"
      aria-label="RBSH command input"
      aria-multiline={false}
      contentEditable={false}
      suppressContentEditableWarning
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      onMouseDown={onFocusArea}
      className="rbsh-active-line"
    >
      <span className="rbsh-prompt">{prompt}</span>
      <span className="rbsh-input-buffer">
        <span className="rbsh-input-text">{beforeCursor}</span>
        <span className="rbsh-cursor-cell">{cursorChar || "\u00A0"}</span>
        <span className="rbsh-input-text">{afterCursor}</span>
      </span>
    </div>
  );
}

export function RBSHTerminal({
  lines,
  buffer,
  cursor,
  prompt,
  showWelcome,
  onSubmit,
  onShortcut,
  onKey,
  onInsert,
}: RBSHTerminalProps) {
  const inputRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, buffer, cursor, showWelcome]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  function focusInput() {
    inputRef.current?.focus({ preventScroll: true });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (isComposingRef.current || event.key === "Process") {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit(buffer);
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      onInsert(event.key);
      return;
    }

    const handled = onKey(event.key, {
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    });

    if (handled) {
      event.preventDefault();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain").replace(/\r?\n/g, "");
    if (text) {
      onInsert(text);
    }
  }

  function handleCompositionStart() {
    isComposingRef.current = true;
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLDivElement>) {
    isComposingRef.current = false;
    event.preventDefault();
    if (event.data) {
      onInsert(event.data);
    }
  }

  return (
    <div className="rbsh-terminal">
      <div
        ref={scrollRef}
        className="rbsh-scroll"
        aria-live="polite"
        onMouseDown={(event) => {
          if (!(event.target as HTMLElement).closest(".rbsh-active-line")) {
            event.preventDefault();
            focusInput();
          }
        }}
      >
        {showWelcome ? <RBSHWelcome onShortcut={onShortcut} /> : null}

        <div className="rbsh-session">
          {lines.map((line) =>
            line.kind === "command" ? (
              <CommandLine
                key={line.id}
                prompt={prompt}
                command={line.command ?? ""}
              />
            ) : (
              <SessionOutput key={line.id} line={line} />
            ),
          )}
        </div>

        <TerminalInputLine
          prompt={prompt}
          buffer={buffer}
          cursor={cursor}
          inputRef={inputRef}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onFocusArea={focusInput}
        />

        <div ref={endRef} className="rbsh-scroll-anchor" />
      </div>
    </div>
  );
}
