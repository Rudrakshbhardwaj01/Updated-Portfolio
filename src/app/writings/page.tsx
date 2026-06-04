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
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <main>
        <header className="mb-12 max-w-2xl">
          <TextLink href="/">← Home</TextLink>

          <h1 className="mt-6 text-xl font-bold tracking-tight">Writings</h1>

          <p className="mt-2 text-base text-secondary">
            Technical and non-technical blogs.
          </p>

          {posts.length > 0 && lastUpdated && (
            <p className="mt-4 text-sm leading-relaxed text-secondary">
              {formatArticleCount(posts.length)}
              <br />
              Last updated: {formatDate(lastUpdated)}
            </p>
          )}
        </header>

        <section aria-label="Articles" className="max-w-2xl">
          {posts.length === 0 ? (
            <p className="text-base text-secondary">No articles yet.</p>
          ) : (
            <ol className="divide-y divide-border">
              {posts.map((post) => (
                <li key={post.slug} className="py-12 first:pt-0 last:pb-0">
                  <article>
                    <h2 className="text-lg font-bold tracking-tight">
                      <a
                        href={`/writings/${post.slug}`}
                        className="text-primary decoration-transparent underline-offset-2 hover:underline hover:decoration-accent/30"
                      >
                        {post.title}
                      </a>
                    </h2>

                    <p className="mt-2 text-xs text-secondary/70">
                      {formatPostMetaLine(post)}
                    </p>

                    <p className="mt-3 text-base leading-relaxed text-secondary">
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
