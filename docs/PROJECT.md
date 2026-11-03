# Rudraksh Bhardwaj Portfolio

## Identity

This is a minimal, text-first personal portfolio for an applied AI engineer. The public site presents professional experience, featured and other projects, skills, education, writings, notes, and a shelf of references. The Next.js application is implemented and statically exportable.

## Scope and requirements

- Preserve the existing editorial portfolio layout and visual identity.
- Keep page content, navigation, project data, and global styling stable unless a feature specifically requires a localized change.
- Serve local public assets without external requests for local visual features.
- Support desktop and mobile layouts and accessible reduced-motion behavior for interactive enhancements.

## Technology

- Next.js 15 with React 19 and TypeScript.
- Tailwind CSS v4 through the PostCSS integration, with additional site styles in `src/app/globals.css`.
- Static public assets under `public/assets/`.
- Build output is exported to `out/`.

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
- Shared footer: [`src/components/Footer.tsx`](../src/components/Footer.tsx)
- Other projects section: [`src/components/OtherProjects.tsx`](../src/components/OtherProjects.tsx)
- Technical map and execution flows: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- Engineering rationale: [`DECISIONS.md`](DECISIONS.md)
