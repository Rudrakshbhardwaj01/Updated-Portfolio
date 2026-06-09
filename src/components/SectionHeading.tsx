type SectionHeadingProps = {
  id: string;
  children: React.ReactNode;
  featured?: boolean;
};

export function SectionHeading({
  id,
  children,
  featured = false,
}: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={
        featured
          ? "brutal-section-title-featured mb-12 text-primary"
          : "brutal-section-title mb-10 text-primary"
      }
    >
      {children}
    </h2>
  );
}
