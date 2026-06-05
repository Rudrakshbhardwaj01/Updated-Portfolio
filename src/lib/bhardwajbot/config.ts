/**
 * BhardwajBot environment configuration.
 *
 * Add your NVIDIA API key to `.env.local` in the project root:
 *
 *   NVIDIA_API_KEY=your_key_here
 *
 * Get a key at https://build.nvidia.com/
 *
 * BhardwajBot stays disabled until this variable is set.
 * Restart the dev server after changing .env.local.
 */

export const BHARDWAJBOT_MODEL = "mistralai/mistral-medium-3.5-128b";

export const NVIDIA_CHAT_COMPLETIONS_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

/** Server-side timeout for a single NVIDIA streaming request (ms). */
export const NVIDIA_REQUEST_TIMEOUT_MS = 60_000;

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

export function getNvidiaConfig(): NvidiaConfig | null {
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
    maxTokens: 500,
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
