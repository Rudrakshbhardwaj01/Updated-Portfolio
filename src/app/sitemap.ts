import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Native Next.js sitemap, prerendered at build time from the same local
 * content source the writings pages use. Only real, public, indexable pages
 * are listed: the homepage, the writings index and its ten articles, the
 * shelf, and the notes. No lastModified is invented for pages without a
 * reliable source date; articles use their frontmatter publication date.
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  const staticPaths = [
    "/",
    "/writings",
    "/shelf",
    "/notes",
    "/notes/cpp",
    "/notes/deep-learning",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteUrl}${path === "/" ? "/" : path}`,
  }));

  for (const post of getAllPosts()) {
    const published = new Date(post.date);
    if (!post.slug || Number.isNaN(published.getTime())) continue;

    entries.push({
      url: `${siteUrl}/writings/${post.slug}`,
      lastModified: published,
    });
  }

  // Defensive de-duplication by absolute URL.
  const unique = new Map(entries.map((entry) => [entry.url, entry]));

  return Array.from(unique.values());
}
