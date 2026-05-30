import { siteConfig } from "@/data/site";
import { TextLink } from "./TextLink";

export function WritingBanner() {
  const { writing } = siteConfig;

  return (
    <section
      aria-label="Writing"
      className="-mx-8 mb-10 border-y border-accent/10 bg-accent/5 px-6 py-3 text-base sm:-mx-8 sm:px-8"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <TextLink href={writing.url}>
          <span className="text-xs font-semibold tracking-[0.15em] uppercase">
            {writing.label}
          </span>
        </TextLink>

        <span className="text-secondary">
          {writing.description}
        </span>
      </div>
    </section>
  );
}