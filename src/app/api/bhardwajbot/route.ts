import { NextResponse } from "next/server";
import {
  toOpenAIMessages,
  trimChatMessages,
  type ChatMessage,
} from "@/lib/bhardwajbot/client";
import {
  BHARDWAJBOT_MODEL,
  getMaxTokensForQuery,
  isNvidiaConfigured,
  MAX_CHAT_MESSAGES,
} from "@/lib/bhardwajbot/config";
import { createRequestId, logBhardwajBot } from "@/lib/bhardwajbot/logger";
import {
  createManagedAbort,
  NvidiaStreamError,
  streamNvidiaCompletion,
} from "@/lib/bhardwajbot/nvidia";
import { buildSystemPrompt, type PageContext } from "@/lib/bhardwajbot/prompt";
import { SafeSseStream } from "@/lib/bhardwajbot/sse-stream";
import { RequestTiming } from "@/lib/bhardwajbot/timing";

export const dynamic = "force-dynamic";

type ChatRequestBody = {
  messages?: ChatMessage[];
  pageContext?: PageContext;
};

export async function POST(request: Request) {
  const requestId = createRequestId();
  const timing = new RequestTiming(requestId);
  timing.mark("request_received");

  logBhardwajBot(requestId, "info", "request_start", {
    model: BHARDWAJBOT_MODEL,
  });

  if (!isNvidiaConfigured()) {
    return NextResponse.json(
      {
        error:
          "BhardwajBot is not configured. Add NVIDIA_API_KEY to .env.local and restart the dev server.",
      },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = trimChatMessages(body.messages ?? [], MAX_CHAT_MESSAGES);

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];

  if (lastMessage.role !== "user" || !lastMessage.content.trim()) {
    return NextResponse.json(
      { error: "The latest message must be a non-empty user message." },
      { status: 400 },
    );
  }

  timing.mark("context_retrieval_start");

  const recentUserQueries = messages
    .slice(0, -1)
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .slice(-3);

  const {
    prompt: systemPrompt,
    promptChars,
    sections,
    isPortfolio,
  } = buildSystemPrompt(
    lastMessage.content,
    body.pageContext,
    recentUserQueries,
  );
  const openAIMessages = toOpenAIMessages(systemPrompt, messages);
  const maxTokens = getMaxTokensForQuery(isPortfolio);

  timing.mark("context_retrieval_end");

  logBhardwajBot(requestId, "info", "context_built", {
    model: BHARDWAJBOT_MODEL,
    promptChars,
    sections: sections.join(","),
    isPortfolio,
    maxTokens,
    messageCount: openAIMessages.length,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const sse = new SafeSseStream(controller);
      const managedAbort = createManagedAbort(requestId, request.signal);
      let tokenCount = 0;
      let streamCompleted = false;

      try {
        timing.mark("model_invocation_start");
        logBhardwajBot(requestId, "info", "model_start", {
          model: BHARDWAJBOT_MODEL,
          promptChars,
        });

        const generator = streamNvidiaCompletion(
          requestId,
          openAIMessages,
          managedAbort,
          maxTokens,
        );

        while (true) {
          if (!sse.isOpen || request.signal.aborted) {
            logBhardwajBot(requestId, "warn", "stream_cancelled", {
              reason: "client_disconnected",
              tokenCount,
            });
            await generator.return({
              chunksReceived: 0,
              contentChunks: 0,
              totalContentChars: 0,
              firstByteMs: null,
              firstTokenMs: null,
              fetchMs: null,
            });
            break;
          }

          const result = await generator.next();

          if (result.done) {
            streamCompleted = true;
            const diagnostics = result.value;

            logBhardwajBot(requestId, "info", "model_end", {
              model: BHARDWAJBOT_MODEL,
              tokenCount,
              chunksReceived: diagnostics?.chunksReceived ?? 0,
              contentChunks: diagnostics?.contentChunks ?? 0,
              totalContentChars: diagnostics?.totalContentChars ?? 0,
              firstByteMs: diagnostics?.firstByteMs ?? null,
              firstTokenMs: diagnostics?.firstTokenMs ?? null,
              fetchMs: diagnostics?.fetchMs ?? null,
            });
            break;
          }

          if (!result.value) {
            continue;
          }

          if (tokenCount === 0) {
            timing.mark("first_token");
          }

          tokenCount += 1;

          if (!sse.safeEnqueue("token", { content: result.value })) {
            break;
          }
        }

        timing.mark("model_invocation_end");

        if (sse.isOpen && !request.signal.aborted) {
          if (tokenCount === 0) {
            sse.safeEnqueue("error", {
              message:
                "BhardwajBot received an empty response. Please try again.",
            });
          } else {
            sse.safeEnqueue("done", {});
            streamCompleted = true;
          }
        }
      } catch (error) {
        timing.mark("model_invocation_end");

        if (error instanceof NvidiaStreamError) {
          if (error.code === "CANCELLED") {
            logBhardwajBot(requestId, "warn", "stream_cancelled", {
              reason: "cancelled",
              tokenCount,
            });
          } else if (error.code === "TIMEOUT") {
            logBhardwajBot(requestId, "warn", "timeout", { tokenCount });

            if (sse.isOpen) {
              if (tokenCount > 0) {
                sse.safeEnqueue("done", {});
                streamCompleted = true;
              } else {
                sse.safeEnqueue("error", { message: error.message });
              }
            }
          } else {
            logBhardwajBot(requestId, "error", "stream_error", {
              model: BHARDWAJBOT_MODEL,
              code: error.code,
              status: error.status ?? null,
              tokenCount,
            });

            if (sse.isOpen) {
              sse.safeEnqueue("error", { message: error.message });
            }
          }
        } else {
          logBhardwajBot(requestId, "error", "stream_error", {
            model: BHARDWAJBOT_MODEL,
            code: "UNKNOWN",
            tokenCount,
            detail: error instanceof Error ? error.message : "unknown",
          });

          if (sse.isOpen) {
            sse.safeEnqueue("error", {
              message:
                "BhardwajBot couldn't respond right now. Please try again.",
            });
          }
        }
      } finally {
        if (sse.isOpen && !streamCompleted && tokenCount > 0) {
          sse.safeEnqueue("done", {});
        }

        managedAbort.cleanup();
        timing.mark("response_complete");
        timing.report();
        sse.safeClose();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Request-Id": requestId,
    },
  });
}
