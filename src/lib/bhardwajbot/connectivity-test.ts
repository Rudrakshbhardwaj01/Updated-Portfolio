import {
  buildNvidiaChatPayload,
  BHARDWAJBOT_MODEL,
  getNvidiaConfig,
  NVIDIA_CHAT_COMPLETIONS_URL,
} from "./config";
import { createRequestId, logBhardwajBot } from "./logger";

const TEST_PROMPT = "Say hello in one sentence.";

export type ConnectivityTestResult = {
  success: boolean;
  requestId: string;
  model: string;
  status: number | null;
  latencyMs: number;
  responsePreview: string;
  rawResponse: string;
  error?: string;
};

/**
 * Sends a minimal prompt to verify NVIDIA Mistral connectivity.
 * Run via: npm run test:bhardwajbot
 */
export async function testMistralConnectivity(): Promise<ConnectivityTestResult> {
  const requestId = createRequestId();
  const config = getNvidiaConfig();
  const start = Date.now();

  if (!config) {
    const result: ConnectivityTestResult = {
      success: false,
      requestId,
      model: BHARDWAJBOT_MODEL,
      status: null,
      latencyMs: Date.now() - start,
      responsePreview: "",
      rawResponse: "",
      error: "NVIDIA_API_KEY is not configured in .env.local",
    };

    logBhardwajBot(requestId, "error", "connectivity_test", {
      success: false,
      error: result.error,
    });

    return result;
  }

  logBhardwajBot(requestId, "info", "connectivity_test", {
    phase: "start",
    model: config.model,
    prompt: TEST_PROMPT,
  });

  const payload = buildNvidiaChatPayload(
    config,
    [{ role: "user", content: TEST_PROMPT }],
    false,
  );

  try {
    const response = await fetch(NVIDIA_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawResponse = await response.text();
    const latencyMs = Date.now() - start;

    logBhardwajBot(requestId, "info", "connectivity_test", {
      phase: "complete",
      status: response.status,
      latencyMs,
      rawLength: rawResponse.length,
    });

    console.info("[BhardwajBot connectivity] Raw response:");
    console.info(rawResponse);

    if (!response.ok) {
      return {
        success: false,
        requestId,
        model: config.model,
        status: response.status,
        latencyMs,
        responsePreview: "",
        rawResponse,
        error: `HTTP ${response.status}`,
      };
    }

    let responsePreview = "";

    try {
      const parsed = JSON.parse(rawResponse) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      responsePreview = parsed.choices?.[0]?.message?.content ?? "";
    } catch {
      responsePreview = rawResponse.slice(0, 200);
    }

    logBhardwajBot(requestId, "info", "connectivity_test", {
      phase: "success",
      preview: responsePreview.slice(0, 100),
    });

    return {
      success: true,
      requestId,
      model: config.model,
      status: response.status,
      latencyMs,
      responsePreview,
      rawResponse,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const message =
      error instanceof Error ? error.message : "Unknown connectivity error";

    logBhardwajBot(requestId, "error", "connectivity_test", {
      phase: "failed",
      error: message,
      latencyMs,
    });

    return {
      success: false,
      requestId,
      model: config.model,
      status: null,
      latencyMs,
      responsePreview: "",
      rawResponse: "",
      error: message,
    };
  }
}
