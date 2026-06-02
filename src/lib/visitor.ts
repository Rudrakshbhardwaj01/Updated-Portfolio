import { Redis } from "@upstash/redis";

export const VISITOR_COUNT_KEY = "unique_visitors";
export const VISITOR_STORAGE_KEY = "portfolio_visitor_counted";

function getRedisEnv(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return { url, token };
}

export function isKvConfigured(): boolean {
  return getRedisEnv() !== null;
}

export function getRedis(): Redis | null {
  const env = getRedisEnv();
  if (!env) {
    return null;
  }

  return new Redis({ url: env.url, token: env.token });
}

export function formatVisitorCount(count: number): string {
  return count.toLocaleString("en-US");
}
