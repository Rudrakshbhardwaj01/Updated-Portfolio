"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/bhardwajbot/client";
import {
  extractNavigation,
  isValidNavigationPath,
} from "@/lib/bhardwajbot/navigation";
import type { PageContext } from "@/lib/bhardwajbot/prompt";

export type BotMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

const WELCOME_MESSAGE =
  "I'm BhardwajBot — ask me about Rudraksh's projects, experience, writings, or what to explore first.";

/** Slightly above server NVIDIA_REQUEST_TIMEOUT_MS (60s). */
const CLIENT_REQUEST_TIMEOUT_MS = 65_000;

export const SUGGESTED_PROMPTS = [
  "What AI projects has Rudraksh built?",
  "What should I look at first?",
  "What is he currently learning?",
  "Show me his writings",
] as const;

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type SseEvent = {
  event: string;
  data: string;
};

function parseSseChunk(chunk: string): SseEvent[] {
  const events: SseEvent[] = [];
  const blocks = chunk.split("\n\n").filter(Boolean);

  for (const block of blocks) {
    const lines = block.split("\n");
    let event = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        event = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        data = line.slice(6);
      }
    }

    if (data) {
      events.push({ event, data });
    }
  }

  return events;
}

type SseTokenPayload = { content?: string };
type SseErrorPayload = { message?: string };

async function releaseStreamReader(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): Promise<void> {
  try {
    await reader.cancel();
  } catch {
    // Reader may already be closed.
  }

  try {
    reader.releaseLock();
  } catch {
    // Lock may already be released.
  }
}

export function useBhardwajBot(pageContext: PageContext) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: WELCOME_MESSAGE,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (rawContent: string) => {
      const content = rawContent.trim();

      if (!content || isLoading) {
        return;
      }

      setConfigError(null);
      setInput("");

      const userMessage: BotMessage = {
        id: createMessageId(),
        role: "user",
        content,
      };

      const assistantId = createMessageId();
      const assistantMessage: BotMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      const history = messages.filter((message) => message.id !== "welcome");
      const apiMessages: ChatMessage[] = [
        ...history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: "user", content },
      ];

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, CLIENT_REQUEST_TIMEOUT_MS);

      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

      try {
        const response = await fetch("/api/bhardwajbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            pageContext,
          }),
          signal: controller.signal,
        });

        if (response.status === 503) {
          const data = (await response.json()) as { error?: string };
          setConfigError(
            data.error ??
              "BhardwajBot is not configured. Add NVIDIA_API_KEY to .env.local.",
          );
          setMessages((prev) =>
            prev.filter((message) => message.id !== assistantId),
          );
          return;
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "BhardwajBot could not authenticate. Check NVIDIA_API_KEY in .env.local.",
          );
        }

        if (response.status === 429) {
          throw new Error(
            "BhardwajBot is busy right now. Please wait a moment and try again.",
          );
        }

        if (!response.ok || !response.body) {
          throw new Error(
            "BhardwajBot couldn't respond right now. Please try again.",
          );
        }

        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let receivedDone = false;
        let receivedError: string | null = null;

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            const events = parseSseChunk(part);

            for (const { event, data } of events) {
              if (event === "token") {
                const parsed = JSON.parse(data) as SseTokenPayload;

                if (parsed.content) {
                  fullContent += parsed.content;
                  const { text } = extractNavigation(fullContent);

                  setMessages((prev) =>
                    prev.map((message) =>
                      message.id === assistantId
                        ? { ...message, content: text }
                        : message,
                    ),
                  );
                }
              }

              if (event === "error") {
                const parsed = JSON.parse(data) as SseErrorPayload;
                receivedError =
                  parsed.message ?? "BhardwajBot couldn't respond right now.";
              }

              if (event === "done") {
                receivedDone = true;
              }
            }
          }
        }

        if (receivedError) {
          throw new Error(receivedError);
        }

        const { text, navigation } = extractNavigation(fullContent);

        if (!text.trim() && !receivedDone) {
          throw new Error(
            "BhardwajBot received an empty response. Please try again.",
          );
        }

        if (text.trim()) {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: text, isStreaming: false }
                : message,
            ),
          );

          if (navigation && isValidNavigationPath(navigation)) {
            router.push(navigation);
          }
        } else {
          setMessages((prev) =>
            prev.filter((message) => message.id !== assistantId),
          );
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content:
                      "BhardwajBot took too long to respond. Please try again.",
                    isStreaming: false,
                  }
                : message,
            ),
          );
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : "BhardwajBot couldn't respond right now. Please try again.";

        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId
              ? {
                  ...message,
                  content: errorMessage,
                  isStreaming: false,
                }
              : message,
          ),
        );
      } finally {
        window.clearTimeout(timeoutId);

        if (reader) {
          await releaseStreamReader(reader);
        }

        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [isLoading, messages, pageContext, router],
  );

  const handleSubmit = useCallback(() => {
    void sendMessage(input);
  }, [input, sendMessage]);

  const handleSuggestedPrompt = useCallback(
    (prompt: string) => {
      void sendMessage(prompt);
    },
    [sendMessage],
  );

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    abortRef.current?.abort();
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    messages,
    input,
    setInput,
    isLoading,
    configError,
    sendMessage,
    handleSubmit,
    handleSuggestedPrompt,
    toggleOpen,
    close,
  };
}
