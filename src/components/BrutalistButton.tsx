type BrutalistButtonProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
};

export function BrutalistButton({
  href,
  children,
  external = false,
}: BrutalistButtonProps) {
  const isExternal =
    external || href.startsWith("http") || href.startsWith("mailto:");

  return (
    <a
      href={href}
      className="brutal-btn inline-flex items-center gap-2 font-mono text-xs font-medium tracking-widest uppercase"
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  );
}
