import Link from "next/link";

export function ShelfNotesBanner() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link
        href="/shelf"
        aria-label="Shelf — books and papers that shaped my thinking"
        className="shelf-banner group flex-1 h-[190px] border-2 border-foreground px-5 py-4 shadow-[5px_5px_0_var(--foreground)] transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2 sm:px-7 flex flex-col"
      >
        <div>
          <h2 className="brutal-role-title text-foreground">
            SHELF
          </h2>

          <p className="brutal-body mt-2 max-w-xl">
            A library of books and research papers I have read or
            am currently reading.
          </p>
        </div>

        <span
          aria-hidden="true"
          className="mt-auto ml-auto font-mono text-xl leading-none text-secondary transition-transform duration-150 ease-out group-hover:translate-x-1 group-hover:text-foreground"
        >
          &rarr;
        </span>
      </Link>

      <Link
        href="/notes"
        aria-label="My Notes — handwritten notes and technical explorations"
        className="shelf-banner group flex-1 h-[190px] border-2 border-foreground px-5 py-4 shadow-[5px_5px_0_var(--foreground)] transition-all duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2 sm:px-7 flex flex-col"
      >
        <div>
          <h2 className="brutal-role-title text-foreground">
            MY NOTES
          </h2>

          <p className="brutal-body mt-2 max-w-xl">
            Handwritten notes, technical explorations, and things I&apos;ve
            worked through.
          </p>
        </div>

        <span
          aria-hidden="true"
          className="mt-auto ml-auto font-mono text-xl leading-none text-secondary transition-transform duration-150 ease-out group-hover:translate-x-1 group-hover:text-foreground"
        >
          &rarr;
        </span>
      </Link>
    </div>
  );
}