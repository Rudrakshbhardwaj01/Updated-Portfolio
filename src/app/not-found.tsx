import { TextLink } from "@/components/TextLink";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20 sm:px-10">
      <main>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-secondary">
          Error 404
        </p>
        <h1 className="brutal-section-title-featured mt-4 text-primary">
          Page not found
        </h1>
        <p className="brutal-body mt-6 max-w-xl">
          The page you requested does not exist, was moved, or was never
          published. Everything that is public lives on the homepage.
        </p>
        <div className="mt-10">
          <TextLink href="/">
            <span className="font-mono text-xs tracking-widest uppercase">
              ← Back to home
            </span>
          </TextLink>
        </div>
      </main>
    </div>
  );
}
