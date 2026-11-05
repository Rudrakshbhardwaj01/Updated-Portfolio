import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Native Next.js robots configuration. Everything public is crawlable;
 * only the API route handlers are excluded. The sitemap reference uses the
 * canonical production origin.
 */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
