type TextLinkProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
};

export function TextLink({ href, children, external }: TextLinkProps) {
  const isExternal =
    external || href.startsWith("http") || href.startsWith("mailto:");

  return (
    <a
      href={href}
      className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  );
}
