/**
 * Single source of truth for the site's canonical public origin.
 *
 * Used by the root layout metadata, the sitemap and robots configuration so
 * every generated absolute URL agrees on the production origin. Falls back
 * to the production domain when the environment variable is unset, malformed,
 * or points at a local host in a production build.
 */

const FALLBACK_SITE_URL = "https://rudraksh.is-a.dev";

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (raw) {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

    try {
      const url = new URL(candidate);

      const isLocal = LOCAL_HOSTNAMES.has(url.hostname);
      const isProductionBuild = process.env.NODE_ENV === "production";

      if (!(isLocal && isProductionBuild)) {
        return url.origin;
      }
    } catch {
      // Malformed override — fall through to the canonical domain.
    }
  }

  return FALLBACK_SITE_URL;
}

/**
 * Join the canonical origin with a root-relative path, e.g.
 * `absoluteSiteUrl("/writings/foo")` → "https://rudraksh.is-a.dev/writings/foo".
 */
export function absoluteSiteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}
