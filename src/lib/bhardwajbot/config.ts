/**
 * BhardwajBot NVIDIA Configuration
 */

export const BHARDWAJBOT_MODEL =
  "nvidia/nemotron-3.5-lightning-30b-a3b";

export const NVIDIA_CHAT_COMPLETIONS_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

export const NVIDIA_FETCH_TIMEOUT_MS = 60_000;
export const NVIDIA_STREAM_TIMEOUT_MS = 90_000;
export const NVIDIA_STREAM_IDLE_TIMEOUT_MS = 20_000;

/** Cap chat history to limit prompt size. */
export const MAX_CHAT_MESSAGES = 4;

/**
 * Token limits for Nemotron 3.5 Lightning 30B A3B on NVIDIA API.
 * Tuned for BhardwajBot's fast, concise portfolio/general responses.
 */
export const PORTFOLIO_MAX_TOKENS = 120;
export const GENERAL_MAX_TOKENS = 120;

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
  chat_template_kwargs?: {
    enable_thinking?: boolean;
  };
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
    temperature: 0.3,
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
    chat_template_kwargs: {
      enable_thinking: false,
    },
  };
}