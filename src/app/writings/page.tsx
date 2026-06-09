import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/components/Footer";
import { TextLink } from "@/components/TextLink";
import {
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
          <nav className="mb-8 font-mono text-xs uppercase tracking-[0.2em] text-secondary">
            <TextLink href="/">Home</TextLink>
            <span className="mx-2">/</span>
            <span className="text-primary">Writings</span>
          </nav>

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Essays · Notes · Technical Deep Dives
          </p>

          <h1 className="brutal-section-title mt-4 text-primary">WRITINGS</h1>

          <div
            className="relative mt-10 aspect-[14/5] w-full overflow-hidden sm:mt-12"
            aria-hidden="true"
          >
            <Image
              src="/assets/banner.png"
              alt=""
              fill
              priority
              sizes="(max-width: 1000px) 100vw, 1000px"
              className="object-cover object-[62%_50%] sm:object-[58%_50%]"
            />
          </div>

          <div className="mt-12 flex flex-wrap gap-8 border-l-4 border-accent pl-4 sm:mt-14">
            <div>
              <p className="font-mono text-[10px] uppercase text-secondary">
                Articles
              </p>
              <p className="font-mono text-lg text-primary">{posts.length}</p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase text-secondary">
                Updated
              </p>
              <p className="font-mono text-lg text-primary">
                {formatDate(lastUpdated)}
              </p>
            </div>
          </div>
        </header>

        <section aria-label="Articles" className="max-w-2xl">
          {posts.length === 0 ? (
            <p className="font-mono text-sm text-secondary">No articles yet.</p>
          ) : (
            <ol>
              {posts.map((post, index) => (
                <li
                  key={post.slug}
                  className="
            group
            border-t border-foreground
            py-10
            transition-all
            duration-300
            hover:translate-x-2
            first:border-t-0
            first:pt-0
          "
                >
                  <article className="flex gap-6">
                    <span className="mt-1 font-mono text-xs text-secondary">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex-1">
                      <h2 className="brutal-project-title text-primary transition-colors duration-300 group-hover:text-accent">
                        <a
                          href={`/writings/${post.slug}`}
                          className="brutal-link"
                        >
                          {post.title}
                        </a>
                      </h2>

                      <p className="mt-2 font-mono text-xs text-secondary">
                        {formatPostMetaLine(post)}
                      </p>

                      <p className="mt-3 font-mono text-sm leading-relaxed text-secondary">
                        {post.description}
                      </p>
                    </div>
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
