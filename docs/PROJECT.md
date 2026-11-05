# Rudraksh Bhardwaj Portfolio

## Identity

This is a minimal, text-first personal portfolio for an applied AI engineer. The public site presents professional experience, featured and other projects, skills, education, writings, notes, and a shelf of references, plus a global Command-K finder, an RBSH terminal, and the BhardwajBot assistant. The Next.js application deploys as a server app (three API route handlers); all pages and the feed/sitemap/robots endpoints prerender statically at build time.

## Scope and requirements

- Preserve the existing editorial portfolio layout and visual identity.
- Keep page content, navigation, project data, and global styling stable unless a feature specifically requires a localized change.
- Serve local public assets without external requests for local visual features.
- Support desktop and mobile layouts and accessible reduced-motion behavior for interactive enhancements.

## Technology

- Next.js 15 with React 19 and TypeScript.
- Tailwind CSS v4 through the PostCSS integration, with additional site styles in `src/app/globals.css`.
- Static public assets under `public/assets/`.
- Canonical site origin configured in `src/lib/site-url.ts` (env: `NEXT_PUBLIC_SITE_URL`, fallback `https://rudraksh.is-a.dev`).

## Development and operation

```bash
npm install
npm run dev
npm run lint
npm run build
```

The site configuration and content live in `src/data/`, while application routes are under `src/app/` and reusable UI is under `src/components/`.

## Navigation

- Home entry point: [`src/app/page.tsx`](../src/app/page.tsx)
- Global Command-K finder: [`src/components/CommandPalette.tsx`](../src/components/CommandPalette.tsx) — visible at the top of every page, hidden while scrolled; compact icon variant on mobile
- Sitemap / robots: `src/app/sitemap.ts`, `src/app/robots.ts`
- Structured data: `src/components/JsonLd.tsx` (Person + WebSite site-wide, BlogPosting per article)
- This portfolio intentionally provides no RSS feed (see DEC-009)
- Shared footer: [`src/components/Footer.tsx`](../src/components/Footer.tsx)
- Other projects section: [`src/components/OtherProjects.tsx`](../src/components/OtherProjects.tsx)
- Technical map and execution flows: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Engineering rationale: [`DECISIONS.md`](DECISIONS.md)
