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
  onInput,
  onPaste,
  onCompositionStart,
  onCompositionEnd,
}: {
  prompt: string;
  buffer: string;
  cursor: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onInput: (event: React.FormEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => void;
}) {
  const beforeCursor = buffer.slice(0, cursor);
  const cursorChar = buffer[cursor] ?? "";
  const afterCursor = buffer.slice(cursor + 1);

  return (
    <div className="rbsh-active-line" aria-hidden="true">
      <span className="rbsh-prompt">{prompt}</span>
      <span className="rbsh-input-buffer">
        <span className="rbsh-input-text">{beforeCursor}</span>
        <span className="rbsh-cursor-cell">{cursorChar || "\u00A0"}</span>
        <span className="rbsh-input-text">{afterCursor}</span>
      </span>
      <input
        ref={inputRef}
        type="text"
        className="rbsh-hidden-input"
        aria-label="RBSH command input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="go"
        onKeyDown={onKeyDown}
        onInput={onInput}
        onPaste={onPaste}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
      />
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
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const keydownHandledRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, buffer, cursor, showWelcome]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  function focusInput() {
    inputRef.current?.focus({ preventScroll: true });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isComposingRef.current || event.key === "Process") {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      onSubmit(buffer);
      return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      keydownHandledRef.current = true;
      onInsert(event.key);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    const handled = onKey(event.key, {
      ctrl: event.ctrlKey,
      meta: event.metaKey,
    });

    if (handled) {
      event.preventDefault();
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleNativeInput(event: React.FormEvent<HTMLInputElement>) {
    if (isComposingRef.current) {
      return;
    }

    if (keydownHandledRef.current) {
      keydownHandledRef.current = false;
      event.currentTarget.value = "";
      return;
    }

    const value = event.currentTarget.value;
    if (value) {
      onInsert(value);
      event.currentTarget.value = "";
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain").replace(/\r?\n/g, "");
    if (text) {
      onInsert(text);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleCompositionStart() {
    isComposingRef.current = true;
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    isComposingRef.current = false;
    event.preventDefault();
    if (event.data) {
      onInsert(event.data);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleTerminalPointerDown(
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) {
    const target = event.target as HTMLElement;

    if (target.closest("a") || target.closest("button")) {
      return;
    }

    focusInput();
  }

  return (
    <div className="rbsh-terminal">
      <div
        ref={scrollRef}
        className="rbsh-scroll"
        aria-live="polite"
        onMouseDown={handleTerminalPointerDown}
        onTouchStart={handleTerminalPointerDown}
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
          onInput={handleNativeInput}
          onPaste={handlePaste}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />

        <div ref={endRef} className="rbsh-scroll-anchor" />
      </div>
    </div>
  );
}
