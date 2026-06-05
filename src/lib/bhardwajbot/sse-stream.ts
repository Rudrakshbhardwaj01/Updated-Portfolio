export type SseStreamState = "open" | "closed";

export type SseEventName = "token" | "done" | "error";

export type SseTokenPayload = { content: string };
export type SseErrorPayload = { message: string };
export type SseDonePayload = Record<string, never>;

export type SsePayload = SseTokenPayload | SseErrorPayload | SseDonePayload;

function encodeSseEvent(event: SseEventName, data: SsePayload): Uint8Array {
  const text = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  return new TextEncoder().encode(text);
}

export class SafeSseStream {
  private state: SseStreamState = "open";

  constructor(private readonly controller: ReadableStreamDefaultController<Uint8Array>) {}

  get isOpen(): boolean {
    return this.state === "open";
  }

  safeEnqueue(event: SseEventName, data: SsePayload): boolean {
    if (this.state !== "open") {
      return false;
    }

    try {
      this.controller.enqueue(encodeSseEvent(event, data));
      return true;
    } catch {
      this.state = "closed";
      return false;
    }
  }

  safeClose(): void {
    if (this.state === "closed") {
      return;
    }

    this.state = "closed";

    try {
      this.controller.close();
    } catch {
      // Stream may already be closed by the runtime when the client disconnects.
    }
  }
}
