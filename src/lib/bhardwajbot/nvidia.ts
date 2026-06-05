import {
  buildNvidiaChatPayload,
  getNvidiaConfig,
  NVIDIA_REQUEST_TIMEOUT_MS,
} from "./config";
import type { OpenAIMessage } from "./client";
import { formatResponseHeaders, logBhardwajBot } from "./logger";

export type NvidiaStreamErrorCode =
  | "NOT_CONFIGURED"
  | "TIMEOUT"
  | "CANCELLED"
  | "RATE_LIMIT"
  | "INVALID_KEY"
  | "NETWORK"
  | "MODEL_ERROR";

type ContentPart = { type?: string; text?: string };

type NvidiaDelta = {
  content?: string | ContentPart[];
};

type NvidiaStreamChunk = {
  choices?: Array<{
    delta?: NvidiaDelta;
    finish_reason?: string | null;
  }>;
};

export type StreamDiagnostics = {
  chunksReceived: number;
  contentChunks: number;
  totalContentChars: number;
  firstByteMs: number | null;
  firstTokenMs: number | null;
  fetchMs: number | null;
};

export class NvidiaStreamError extends Error {
  readonly code: NvidiaStreamErrorCode;
  readonly status?: number;

  constructor(code: NvidiaStreamErrorCode, message: string, status?: number) {
    super(message);
    this.name = "NvidiaStreamError";
    this.code = code;
    this.status = status;
  }
}

export type ManagedAbort = {
  signal: AbortSignal;
  cleanup: () => void;
  wasCancelled: () => boolean;
  wasTimedOut: () => boolean;
};

function extractDeltaContent(
  raw: string | ContentPart[] | null | undefined,
): string {
  if (typeof raw === "string") {
    return raw;
  }

  if (Array.isArray(raw)) {
    return raw.map((part) => part.text ?? "").join("");
  }

  return "";
}

function mapHttpError(status: number, body?: string): NvidiaStreamError {
  if (status === 401 || status === 403) {
    return new NvidiaStreamError(
      "INVALID_KEY",
      "BhardwajBot could not authenticate with NVIDIA. Check NVIDIA_API_KEY in .env.local.",
      status,
    );
  }

  if (status === 429) {
    return new NvidiaStreamError(
      "RATE_LIMIT",
      "BhardwajBot is receiving too many requests right now. Please wait a moment and try again.",
      status,
    );
  }

  const detail = body ? ` Response: ${body.slice(0, 200)}` : "";

  return new NvidiaStreamError(
    "MODEL_ERROR",
    `BhardwajBot couldn't get a response from the model.${detail}`,
    status,
  );
}

function resolveAbortError(managedAbort: ManagedAbort): NvidiaStreamError {
  if (managedAbort.wasCancelled()) {
    return new NvidiaStreamError("CANCELLED", "Request was cancelled.");
  }

  if (managedAbort.wasTimedOut()) {
    return new NvidiaStreamError(
      "TIMEOUT",
      "BhardwajBot took too long to respond. Please try again.",
    );
  }

  return new NvidiaStreamError(
    "TIMEOUT",
    "BhardwajBot took too long to respond. Please try again.",
  );
}

export function createManagedAbort(
  requestId: string,
  parentSignal?: AbortSignal,
): ManagedAbort {
  const controller = new AbortController();
  let cancelledByClient = false;
  let timedOut = false;
  let cleanedUp = false;

  const timeoutId = setTimeout(() => {
    timedOut = true;
    logBhardwajBot(requestId, "warn", "timeout", {
      timeoutMs: NVIDIA_REQUEST_TIMEOUT_MS,
    });
    controller.abort();
  }, NVIDIA_REQUEST_TIMEOUT_MS);

  const onParentAbort = () => {
    cancelledByClient = true;
    logBhardwajBot(requestId, "warn", "client_abort");
    clearTimeout(timeoutId);
    controller.abort();
  };

  if (parentSignal) {
    if (parentSignal.aborted) {
      cancelledByClient = true;
      clearTimeout(timeoutId);
      controller.abort();
    } else {
      parentSignal.addEventListener("abort", onParentAbort, { once: true });
    }
  }

  const cleanup = () => {
    if (cleanedUp) {
      return;
    }

    cleanedUp = true;
    clearTimeout(timeoutId);

    if (parentSignal) {
      parentSignal.removeEventListener("abort", onParentAbort);
    }
  };

  controller.signal.addEventListener("abort", cleanup, { once: true });

  return {
    signal: controller.signal,
    cleanup,
    wasCancelled: () => cancelledByClient,
    wasTimedOut: () => timedOut,
  };
}

async function releaseReader(
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

function parseSseDataLine(line: string): string | null {
  const trimmed = line.trim();

  if (!trimmed.startsWith("data:")) {
    return null;
  }

  return trimmed.slice(5).trim();
}

export async function* streamNvidiaCompletion(
  requestId: string,
  messages: OpenAIMessage[],
  managedAbort: ManagedAbort,
): AsyncGenerator<string, StreamDiagnostics, undefined> {
  const config = getNvidiaConfig();

  if (!config) {
    throw new NvidiaStreamError(
      "NOT_CONFIGURED",
      "BhardwajBot is not configured. Add NVIDIA_API_KEY to .env.local.",
    );
  }

  const streamStart = Date.now();
  const diagnostics: StreamDiagnostics = {
    chunksReceived: 0,
    contentChunks: 0,
    totalContentChars: 0,
    firstByteMs: null,
    firstTokenMs: null,
    fetchMs: null,
  };

  const payload = buildNvidiaChatPayload(config, messages, true);

  logBhardwajBot(requestId, "info", "fetch_start", {
    model: config.model,
    messageCount: messages.length,
  });

  let response: Response;

  try {
    const fetchStart = Date.now();

    response = await fetch(config.chatCompletionsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: managedAbort.signal,
    });

    diagnostics.fetchMs = Date.now() - fetchStart;

    logBhardwajBot(requestId, "info", "fetch_complete", {
      fetchMs: diagnostics.fetchMs,
      status: response.status,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw resolveAbortError(managedAbort);
    }

    throw new NvidiaStreamError(
      "NETWORK",
      "BhardwajBot couldn't reach the model. Check your connection and try again.",
    );
  }

  logBhardwajBot(requestId, "info", "response_status", {
    status: response.status,
    ok: response.ok,
  });

  logBhardwajBot(requestId, "info", "response_headers", {
    headers: formatResponseHeaders(response.headers),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw mapHttpError(response.status, errorBody);
  }

  if (!response.body) {
    throw new NvidiaStreamError(
      "MODEL_ERROR",
      "BhardwajBot received an empty response. Please try again.",
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (managedAbort.signal.aborted) {
        throw resolveAbortError(managedAbort);
      }

      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (diagnostics.firstByteMs === null) {
        diagnostics.firstByteMs = Date.now() - streamStart;
        logBhardwajBot(requestId, "info", "first_byte", {
          latencyMs: diagnostics.firstByteMs,
        });
      }

      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by blank lines; lines may arrive split across chunks.
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const eventBlock of events) {
        const lines = eventBlock.split("\n");

        for (const line of lines) {
          const data = parseSseDataLine(line);

          if (data === null) {
            continue;
          }

          if (data === "[DONE]") {
            logBhardwajBot(requestId, "info", "stream_complete", {
              totalMs: Date.now() - streamStart,
              contentChunks: diagnostics.contentChunks,
              totalContentChars: diagnostics.totalContentChars,
            });
            return diagnostics;
          }

          let parsed: NvidiaStreamChunk;

          try {
            parsed = JSON.parse(data) as NvidiaStreamChunk;
          } catch {
            continue;
          }

          diagnostics.chunksReceived += 1;

          const content = extractDeltaContent(
            parsed.choices?.[0]?.delta?.content,
          );

          if (content) {
            if (diagnostics.firstTokenMs === null) {
              diagnostics.firstTokenMs = Date.now() - streamStart;
              logBhardwajBot(requestId, "info", "first_token", {
                latencyMs: diagnostics.firstTokenMs,
              });
            }

            diagnostics.contentChunks += 1;
            diagnostics.totalContentChars += content.length;
            yield content;
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof NvidiaStreamError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw resolveAbortError(managedAbort);
    }

    throw error;
  } finally {
    await releaseReader(reader);
    managedAbort.cleanup();
  }

  logBhardwajBot(requestId, "info", "stream_complete", {
    totalMs: Date.now() - streamStart,
    contentChunks: diagnostics.contentChunks,
    totalContentChars: diagnostics.totalContentChars,
  });

  return diagnostics;
}
