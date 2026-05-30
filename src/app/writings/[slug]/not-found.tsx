import { TextLink } from "@/components/TextLink";

export default function NotFound() {
  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <main>
        <h1 className="text-xl font-bold tracking-tight">Article not found</h1>
        <p className="mt-2 text-base text-secondary">
          The article you are looking for does not exist.
        </p>
        <p className="mt-4">
          <TextLink href="/writings">← Back to writings</TextLink>
        </p>
      </main>
    </div>
  );
}
