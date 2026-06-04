import fs from "fs";
import path from "path";
import matter from "gray-matter";

const writingsDirectory = path.join(process.cwd(), "src/content/writings");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
  category: string;
  readingTimeMinutes: number;
};

export type Post = PostMeta & {
  content: string;
};

const WORDS_PER_MINUTE = 200;

function estimateReadingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function getMdFiles(): string[] {
  if (!fs.existsSync(writingsDirectory)) {
    return [];
  }

  return fs
    .readdirSync(writingsDirectory)
    .filter((file) => file.endsWith(".md"));
}

export function getAllPosts(): PostMeta[] {
  const posts = getMdFiles().map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(writingsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      description: data.description as string,
      category: data.category as string,
      readingTimeMinutes: estimateReadingTimeMinutes(content),
    };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(writingsDirectory, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    description: data.description as string,
    category: data.category as string,
    readingTimeMinutes: estimateReadingTimeMinutes(content),
    content,
  };
}

export function getAllSlugs(): string[] {
  return getMdFiles().map((file) => file.replace(/\.md$/, ""));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

export function formatPostMetaLine(post: PostMeta): string {
  return `${formatDate(post.date)} · ${formatReadingTime(post.readingTimeMinutes)} · ${post.category}`;
}

export function formatArticleCount(count: number): string {
  return count === 1 ? "1 article published" : `${count} articles published`;
}
