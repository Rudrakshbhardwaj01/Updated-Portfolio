import { marked } from "marked";

type PostContentProps = {
  content: string;
};

export function PostContent({ content }: PostContentProps) {
  const html = marked.parse(content, { async: false }) as string;

  return (
    <article
      className="post-content mt-8 text-[20px] leading-[1.9]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}