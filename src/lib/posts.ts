import fs from "fs";
import path from "path";
import matter from "gray-matter";

const writingsDirectory = path.join(process.cwd(), "src/content/writings");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description: string;
};

export type Post = PostMeta & {
  content: string;
};

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
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title as string,
      date: data.date as string,
      description: data.description as string,
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
