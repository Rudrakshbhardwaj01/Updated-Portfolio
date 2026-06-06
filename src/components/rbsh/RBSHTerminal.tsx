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
  onSyncBuffer: (buffer: string, cursor: number) => void;
  onSetCursor: (cursor: number) => void;
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
  onChange,
  onSelect,
  onKeyDown,
  onPaste,
  onCompositionStart,
  onCompositionEnd,
}: {
  prompt: string;
  buffer: string;
  cursor: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (event: React.SyntheticEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (event: CompositionEvent<HTMLInputElement>) => void;
}) {
  const beforeCursor = buffer.slice(0, cursor);
  const cursorChar = buffer[cursor] ?? "";
  const afterCursor = buffer.slice(cursor + 1);

  return (
    <div className="rbsh-active-line">
      <span className="rbsh-prompt" aria-hidden="true">
        {prompt}
      </span>
      <span className="rbsh-input-buffer" aria-hidden="true">
        <span className="rbsh-input-text">{beforeCursor}</span>
        <span className="rbsh-cursor-cell">{cursorChar || "\u00A0"}</span>
        <span className="rbsh-input-text">{afterCursor}</span>
      </span>
      <input
        ref={inputRef}
        type="text"
        className="rbsh-hidden-input"
        value={buffer}
        aria-label="RBSH command input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="go"
        onChange={onChange}
        onSelect={onSelect}
        onKeyDown={onKeyDown}
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
  onSyncBuffer,
  onSetCursor,
}: RBSHTerminalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, buffer, cursor, showWelcome]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || document.activeElement !== input) {
      return;
    }

    input.setSelectionRange(cursor, cursor);
  }, [buffer, cursor]);

  function focusInput() {
    inputRef.current?.focus({ preventScroll: true });
  }

  function readCursor(element: HTMLInputElement): number {
    const start = element.selectionStart;
    return start ?? element.value.length;
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (isComposingRef.current) {
      return;
    }

    const element = event.target;
    onSyncBuffer(element.value, readCursor(element));
  }

  function handleSelect(event: React.SyntheticEvent<HTMLInputElement>) {
    onSetCursor(readCursor(event.currentTarget));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isComposingRef.current || event.key === "Process") {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      onSubmit(buffer);
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

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain").replace(/\r?\n/g, "");
    if (!text) {
      return;
    }

    const element = event.currentTarget;
    const start = element.selectionStart ?? buffer.length;
    const end = element.selectionEnd ?? buffer.length;
    const nextValue = buffer.slice(0, start) + text + buffer.slice(end);
    const nextCursor = start + text.length;
    onSyncBuffer(nextValue, nextCursor);
  }

  function handleCompositionStart() {
    isComposingRef.current = true;
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLInputElement>) {
    isComposingRef.current = false;
    if (event.data) {
      const element = event.currentTarget;
      onSyncBuffer(element.value, readCursor(element));
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
          onChange={handleChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />

        <div ref={endRef} className="rbsh-scroll-anchor" />
      </div>
    </div>
  );
}
