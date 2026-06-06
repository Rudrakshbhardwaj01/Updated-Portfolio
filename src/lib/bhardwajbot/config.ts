/**
 * BhardwajBot NVIDIA Configuration
 */

export const BHARDWAJBOT_MODEL = "meta/llama-3.1-70b-instruct";

export const NVIDIA_CHAT_COMPLETIONS_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

/** Max wait for NVIDIA to return response headers / first byte. */
export const NVIDIA_FETCH_TIMEOUT_MS = 15_000;

/** Max total time for a single NVIDIA request after it starts. */
export const NVIDIA_STREAM_TIMEOUT_MS = 60_000;

/**
 * If the model stream goes silent after content has started, stop waiting.
 * Prevents hung streams that never send [DONE].
 */
export const NVIDIA_STREAM_IDLE_TIMEOUT_MS = 30_000;

/** Cap chat history to limit prompt size on 70B. */
export const MAX_CHAT_MESSAGES = 4;

export const PORTFOLIO_MAX_TOKENS = 150;
export const GENERAL_MAX_TOKENS = 100;

export type NvidiaConfig = {
  apiKey: string;
  model: string;
  chatCompletionsUrl: string;
  temperature: number;
  topP: number;
  maxTokens: number;
};

export type NvidiaChatCompletionPayload = {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  top_p: number;
  max_tokens: number;
  stream: boolean;
};

export function isNvidiaConfigured(): boolean {
  const apiKey = process.env.NVIDIA_API_KEY;
  return typeof apiKey === "string" && apiKey.trim().length > 0;
}

export function getMaxTokensForQuery(isPortfolio: boolean): number {
  return isPortfolio ? PORTFOLIO_MAX_TOKENS : GENERAL_MAX_TOKENS;
}

export function getNvidiaConfig(maxTokens?: number): NvidiaConfig | null {
  const apiKey = process.env.NVIDIA_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    model: BHARDWAJBOT_MODEL,
    chatCompletionsUrl: NVIDIA_CHAT_COMPLETIONS_URL,
    temperature: 0.2,
    topP: 0.9,
    maxTokens: maxTokens ?? GENERAL_MAX_TOKENS,
  };
}

export function buildNvidiaChatPayload(
  config: NvidiaConfig,
  messages: Array<{ role: string; content: string }>,
  stream: boolean,
): NvidiaChatCompletionPayload {
  return {
    model: config.model,
    messages,
    temperature: config.temperature,
    top_p: config.topP,
    max_tokens: config.maxTokens,
    stream,
  };
}
