type PostContentProps = {
  html: string;
};

export function PostContent({ html }: PostContentProps) {
  return (
    <article
      className="post-content mt-8 text-[20px] leading-[1.9]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}