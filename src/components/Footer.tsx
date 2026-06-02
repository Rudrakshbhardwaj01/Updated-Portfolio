import { siteConfig } from "@/data/site";
import { VisitorCount } from "./VisitorCount";

export function Footer() {
  return (
    <footer className="mt-16 text-center text-xs text-secondary">
      [+] last updated: {siteConfig.lastUpdated}
      <br />
      [+] unique visitors: <VisitorCount />
    </footer>
  );
}
