import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleNarrator } from "@/components/ArticleNarrator";
import { ArticleToc } from "@/components/ArticleToc";
import { BlogFeedbackForm } from "@/components/BlogFeedbackForm";
import { CodeBlockEnhancer } from "@/components/CodeBlockEnhancer";
import { JsonLd } from "@/components/JsonLd";
import { MermaidHydrator } from "@/components/MermaidHydrator";
import { ReadingProgressNavigator } from "@/components/ReadingProgressNavigator";
import { Footer } from "@/components/Footer";
import { PostContent } from "@/components/PostContent";
import { TextLink } from "@/components/TextLink";
import {
  formatDate,
  getAllSlugs,
  getPostBySlug,
} from "@/lib/posts";
import { preparePostContent } from "@/lib/renderPostMarkdown";
import { getSiteUrl } from "@/lib/site-url";

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

  const url = `${getSiteUrl()}/writings/${post.slug}`;
  const ogImage = `${getSiteUrl()}/assets/heroBanner.png`;

  return {
    title: `${post.title} | Rudraksh Bhardwaj`,
    description: post.description,
    alternates: {
      canonical: `/writings/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.date,
      siteName: "Rudraksh Bhardwaj",
      images: [{ url: ogImage, width: 720, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const blogUrl = `${siteUrl}/writings/${slug}`;
  const ogImage = `${siteUrl}/assets/heroBanner.png`;
  const { html, headings } = preparePostContent(post.content);

  // BlogPosting structured data — only facts already visible on the page.
  // The author/publisher nodes reference the site-level Person in the root
  // layout's JSON-LD graph.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${blogUrl}#article`,
    headline: post.title,
    description: post.description,
    url: blogUrl,
    mainEntityOfPage: blogUrl,
    datePublished: post.date,
    articleSection: post.category,
    inLanguage: "en",
    author: { "@id": `${siteUrl}/#person` },
    publisher: { "@id": `${siteUrl}/#person` },
    isPartOf: { "@id": `${siteUrl}/#website` },
    image: ogImage,
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <main>
        <JsonLd data={articleJsonLd} />

        <header className="mb-10">
          <TextLink href="/writings">← Writings</TextLink>

          <div className="mt-6">
            <p className="text-base text-secondary">
              {formatDate(post.date)}
            </p>
            <div className="mt-3">
              <ArticleNarrator />
            </div>
          </div>
        </header>

        <PostContent html={html} />

        <CodeBlockEnhancer />

        <MermaidHydrator />

        <ArticleToc headings={headings} />

        <ReadingProgressNavigator headings={headings} />

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
