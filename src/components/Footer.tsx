import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-16 text-center text-xs text-secondary">
      [+] last updated: {siteConfig.lastUpdated}
    </footer>
  );
}
