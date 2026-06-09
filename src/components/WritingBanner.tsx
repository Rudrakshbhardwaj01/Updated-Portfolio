import { siteConfig } from "@/data/site";
import { TextLink } from "./TextLink";

export function WritingBanner() {
  const { writing } = siteConfig;

  return (
    <div
      aria-label="Writing"
      className="writing-banner flex min-w-0 flex-1 items-center border-2 border-foreground shadow-[5px_5px_0_var(--foreground)]"
    >
      <span className="writing-banner-accent" aria-hidden="true" />
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 sm:px-5 sm:py-3.5">
        <TextLink href={writing.url}>
          <span className="brutal-role-title text-[1.35rem] sm:text-[1.5rem]">
            {writing.label}
          </span>
        </TextLink>
        <span className="brutal-body text-sm sm:text-base">
          {writing.description}
        </span>
      </div>
    </div>
  );
}
