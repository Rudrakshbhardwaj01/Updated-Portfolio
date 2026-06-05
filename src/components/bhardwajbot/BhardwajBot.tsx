"use client";

import { FormEvent, useEffect, useRef } from "react";
import { BhardwajBotAvatar } from "./BhardwajBotAvatar";
import { TypingIndicator } from "./TypingIndicator";
import { SUGGESTED_PROMPTS, useBhardwajBot } from "./useBhardwajBot";
import { usePageContext } from "./usePageContext";

function showTypingIndicator(message: {
  role: string;
  content: string;
  isStreaming?: boolean;
}): boolean {
  return (
    message.role === "assistant" &&
    message.isStreaming === true &&
    message.content.trim().length === 0
  );
}

export function BhardwajBot() {
  const pageContext = usePageContext();
  const {
    isOpen,
    messages,
    input,
    setInput,
    isLoading,
    configError,
    handleSubmit,
    handleSuggestedPrompt,
    toggleOpen,
    close,
  } = useBhardwajBot(pageContext);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const showSuggestions =
    messages.length === 1 && messages[0].id === "welcome" && !isLoading;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    handleSubmit();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <section
          id="bhardwajbot-panel"
          aria-label="BhardwajBot"
          className="flex w-[min(100vw-3rem,22rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-[opacity,transform] duration-200 dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2.5">
              <BhardwajBotAvatar size="md" />
              <div>
                <p className="text-sm font-semibold text-primary">BhardwajBot</p>
                <p className="text-xs text-secondary">
                  Explore this portfolio
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={close}
              className="text-sm text-secondary transition-colors hover:text-primary"
              aria-label="Close BhardwajBot"
            >
              close
            </button>
          </header>

          <div className="flex max-h-[min(60vh,28rem)] flex-col gap-4 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex items-start gap-2.5"
                }
              >
                {message.role === "assistant" && <BhardwajBotAvatar />}

                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-2xl border border-accent/10 bg-accent/5 px-3 py-2 text-sm leading-relaxed text-primary"
                      : "min-w-0 flex-1 text-sm leading-relaxed text-secondary"
                  }
                >
                  {showTypingIndicator(message) ? (
                    <TypingIndicator />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {configError && (
              <p className="text-xs leading-relaxed text-secondary">
                {configError}
              </p>
            )}

            {showSuggestions && (
              <div className="space-y-2 border-t border-border pt-3">
                <p className="text-xs text-secondary">Try asking</p>
                <div className="flex flex-col items-start gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="text-left text-sm text-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={onSubmit}
            className="border-t border-border px-4 py-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask about projects, experience, writings…"
                disabled={isLoading}
                className="max-h-24 min-h-[2.25rem] flex-1 resize-none bg-transparent text-sm text-primary outline-none placeholder:text-secondary disabled:opacity-60"
                aria-label="Message to BhardwajBot"
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-border disabled:text-secondary disabled:opacity-100"
                aria-label="Send message"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M12 19V5" />
                  <path d="m7 10 5-5 5 5" />
                </svg>
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-[color,box-shadow] duration-200 hover:text-accent dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] md:hidden"
        aria-expanded={isOpen}
        aria-controls="bhardwajbot-panel"
        aria-label="Open BhardwajBot"
      >
        <BhardwajBotAvatar size="md" className="!h-10 !w-10" />
      </button>

      <button
        type="button"
        onClick={toggleOpen}
        className="hidden items-center gap-2.5 rounded-2xl border border-border bg-background px-3.5 py-2.5 text-sm text-primary shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-[color,box-shadow] duration-200 hover:text-accent dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] md:flex"
        aria-expanded={isOpen}
        aria-controls="bhardwajbot-panel"
      >
        <BhardwajBotAvatar size="md" />
        <span className="font-semibold">BhardwajBot</span>
      </button>
    </div>
  );
}
