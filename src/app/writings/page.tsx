import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { TextLink } from "@/components/TextLink";
import { formatDate, getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Writings | Rudraksh Bhardwaj",
  description: "Technical and non-technical blogs.",
};

export default function WritingsPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <main>
        <header className="mb-10">
          <TextLink href="/">← Home</TextLink>

          <h1 className="mt-6 text-xl font-bold tracking-tight">Writings</h1>

          <p className="mt-2 max-w-2xl text-base text-secondary">
            Technical and non-technical blogs.
          </p>
        </header>

        <section aria-label="Articles">
          {posts.length === 0 ? (
            <p className="text-base text-secondary">No articles yet.</p>
          ) : (
            <ol className="space-y-8 text-base leading-relaxed">
              {posts.map((post) => (
                <li key={post.slug}>
                  <TextLink href={`/writings/${post.slug}`}>
                    {post.title}
                  </TextLink>

                  <p className="mt-1 text-sm text-secondary">
                    {formatDate(post.date)}
                  </p>

                  <p className="mt-1 text-secondary">{post.description}</p>
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
