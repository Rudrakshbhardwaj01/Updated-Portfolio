import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogFeedbackForm } from "@/components/BlogFeedbackForm";
import { Footer } from "@/components/Footer";
import { PostContent } from "@/components/PostContent";
import { TextLink } from "@/components/TextLink";
import {
  formatDate,
  getAllSlugs,
  getPostBySlug,
} from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Not Found" };
  }

  return {
    title: `${post.title} | Rudraksh Bhardwaj`,
    description: post.description,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://rudraksh.is-a.dev";
  const blogUrl = `${siteUrl}/writings/${slug}`;

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <main>
        <header className="mb-10">
          <TextLink href="/writings">← Writings</TextLink>

          <p className="mt-6 text-base text-secondary">
            {formatDate(post.date)}
          </p>
        </header>

        <PostContent content={post.content} />

        <BlogFeedbackForm
          blogTitle={post.title}
          blogSlug={post.slug}
          blogUrl={blogUrl}
        />
      </main>

      <Footer />
    </div>
  );
}
