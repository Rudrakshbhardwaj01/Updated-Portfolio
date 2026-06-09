import { navLinks, siteConfig } from "@/data/site";
import { VisitorCount } from "./VisitorCount";
import { TextLink } from "./TextLink";

export function Footer() {
  return (
    <footer className="mt-20 border-t-2 border-foreground pt-8">
      <nav
        className="flex flex-wrap gap-x-5 gap-y-2"
        aria-label="Page sections"
      >
        {navLinks.map((link) => (
          <TextLink key={link.label} href={link.href}>
            <span className="font-mono text-xs tracking-widest uppercase">
              {link.label}
            </span>
          </TextLink>
        ))}
      </nav>

      <p className="brutal-body mt-6 text-sm">
        Last updated {siteConfig.lastUpdated} · <VisitorCount /> unique visitors
      </p>
    </footer>
  );
}
