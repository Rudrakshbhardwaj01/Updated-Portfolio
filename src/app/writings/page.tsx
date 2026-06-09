import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { TextLink } from "@/components/TextLink";
import {
  formatArticleCount,
  formatDate,
  formatPostMetaLine,
  getAllPosts,
} from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writings | Rudraksh Bhardwaj",
  description: "Technical and non-technical blogs.",
};

export default function WritingsPage() {
  const posts = getAllPosts();
  const lastUpdated = posts[0]?.date;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-14 sm:px-10 sm:py-20">
      <main>
        <header className="mb-12 max-w-2xl">
          <TextLink href="/">← Home</TextLink>

          <h1 className="brutal-section-title mt-8 text-primary">Writings</h1>

          <p className="mt-4 font-mono text-sm text-secondary">
            Technical and non-technical blogs.
          </p>

          {posts.length > 0 && lastUpdated && (
            <p className="mt-4 font-mono text-xs leading-relaxed text-secondary">
              {formatArticleCount(posts.length)}
              <br />
              Last updated: {formatDate(lastUpdated)}
            </p>
          )}
        </header>

        <section aria-label="Articles" className="max-w-2xl">
          {posts.length === 0 ? (
            <p className="font-mono text-sm text-secondary">No articles yet.</p>
          ) : (
            <ol>
              {posts.map((post) => (
                <li
                  key={post.slug}
                  className="border-t-2 border-foreground py-10 first:border-t-0 first:pt-0"
                >
                  <article>
                    <h2 className="brutal-project-title text-primary">
                      <a href={`/writings/${post.slug}`} className="brutal-link">
                        {post.title}
                      </a>
                    </h2>

                    <p className="mt-2 font-mono text-xs text-secondary">
                      {formatPostMetaLine(post)}
                    </p>

                    <p className="mt-3 font-mono text-sm leading-relaxed text-secondary">
                      {post.description}
                    </p>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
