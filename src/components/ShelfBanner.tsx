import Link from "next/link";

/**
 * Editorial banner placed on the Writings page. Quietly invites visitors to
 * explore the Shelf. Uses the same brutalist border + offset-shadow vocabulary
 * as the rest of the site, with a subtle highlight tint so it reads as a
 * continuation of the page rather than an advertisement.
 */
export function ShelfBanner() {
  return (
    <Link
      href="/shelf"
      aria-label="Shelf — books and papers that shaped my thinking"
      className="shelf-banner group block w-full border-2 border-foreground px-5 py-5 shadow-[5px_5px_0_var(--foreground)] transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2 sm:px-7 sm:py-6"
    >
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="min-w-0 flex-1">
          <h2 className="brutal-role-title mt-2 text-foreground">
          SHELF
          </h2>
          <p className="brutal-body mt-2 max-w-xl">
            A curated collection of books and research papers I have read or
            am currently reading.
          </p>
        </div>
        <span
          aria-hidden="true"
          className="ml-auto font-mono text-xl leading-none text-secondary transition-transform duration-150 ease-out group-hover:translate-x-1 group-hover:text-foreground"
        >
          &rarr;
        </span>
      </div>
    </Link>
  );
}
