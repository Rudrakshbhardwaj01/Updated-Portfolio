import { randomUUID } from "crypto";

export type LogLevel = "info" | "warn" | "error";

export type BhardwajBotLogEvent =
  | "request_start"
  | "context_built"
  | "model_start"
  | "fetch_start"
  | "fetch_complete"
  | "response_status"
  | "response_headers"
  | "first_byte"
  | "first_token"
  | "model_end"
  | "stream_complete"
  | "stream_error"
  | "stream_cancelled"
  | "stream_closed"
  | "client_abort"
  | "timeout"
  | "connectivity_test";

type LogMeta = Record<string, string | number | boolean | null | undefined>;

export function createRequestId(): string {
  return randomUUID().slice(0, 8);
}

export function logBhardwajBot(
  requestId: string,
  level: LogLevel,
  event: BhardwajBotLogEvent,
  meta?: LogMeta,
): void {
  const payload = {
    requestId,
    event,
    ...meta,
  };

  const line = `[BhardwajBot] ${JSON.stringify(payload)}`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export function formatResponseHeaders(headers: Headers): string {
  const relevant = [
    "content-type",
    "x-request-id",
    "nvcf-reqid",
    "nvcf-status",
  ];

  const parts: string[] = [];

  for (const key of relevant) {
    const value = headers.get(key);
    if (value) {
      parts.push(`${key}=${value}`);
    }
  }

  return parts.join("; ") || "none";
}
