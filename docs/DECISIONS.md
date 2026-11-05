# Decisions

## DEC-001 — Keep one character instance attached to each active footer divider

- **Status:** Accepted
- **Basis:** User requirement; repository evidence
- **Context:** The home page's `OtherProjects` section is followed by the shared footer, whose existing top border is the divider below the final project description and above footer navigation.
- **Decision:** Mount `MaleHunter` once from the root layout and position its absolute rail from the active route's existing footer border. Keep the walking controller and animation styles isolated in the character component.
- **Rationale:** This preserves the homepage divider, makes the non-interactive walker available on every current and future route with a footer, and avoids duplicate controllers during client-side navigation.
- **Alternatives considered:** Passing a child through every page footer would duplicate integration points and could create multiple instances. Rendering a separate character on each route would reset movement and widen the feature's layout scope. Changing global CSS would affect unrelated portfolio styling.
- **Trade-offs and consequences:** The root layout owns the single global walker, while the component observes footer replacement and calculates document coordinates. Existing footer markup and design tokens remain unchanged.
- **Evidence and code references:** [`src/app/layout.tsx`](../src/app/layout.tsx), [`src/components/MaleHunter.tsx`](../src/components/MaleHunter.tsx), [`src/components/MaleHunter.module.css`](../src/components/MaleHunter.module.css), and [`src/components/Footer.tsx`](../src/components/Footer.tsx).
- **Revisit conditions:** Revisit if routes stop sharing a footer or if the sprite pack's canvas/ground-line contract changes.

## DEC-002 — Render the landscape globally after route content

- **Status:** Accepted
- **Basis:** User requirement; repository evidence
- **Context:** The supplied landscape must appear once below the complete footer on every route without changing route-specific page structure.
- **Decision:** Mount a single `LandscapeFooter` from the root layout after `{children}`, using the existing `public/assets/footer.jpg` and a dedicated CSS-module fade mask.
- **Rationale:** Root-layout placement gives direct loads and client-side routes the same ordering, while the native aspect ratio and alpha mask preserve the artwork and soften its boundary into the existing background.
- **Alternatives considered:** Adding the image to each page footer would duplicate integration points and risk inconsistent ordering. Modifying global CSS would expand the scope of a localized visual addition.
- **Trade-offs and consequences:** The landscape contributes responsive page height after the footer and relies on the root background variable for seamless blending.
- **Evidence and code references:** [`src/app/layout.tsx`](../src/app/layout.tsx), [`src/components/LandscapeFooter.tsx`](../src/components/LandscapeFooter.tsx), [`src/components/LandscapeFooter.module.css`](../src/components/LandscapeFooter.module.css), and [`public/assets/footer.jpg`](../public/assets/footer.jpg).
- **Revisit conditions:** Revisit if the supplied artwork's dimensions or the shared root layout ordering changes.

## DEC-003 — Global reading-progress navigator via the shared article route

- **Status:** Accepted
- **Basis:** User requirement; repository evidence
- **Context:** The portfolio blog needs a persistent bottom-centre reading-progress navigator (circular SVG ring + current section title, brutalist styling) on every article, present and future, with no per-article integration.
- **Decision:** Mount one `ReadingProgressNavigator` from the shared `src/app/writings/[slug]/page.tsx` alongside `ArticleToc`, and move active-section tracking into the shared `useActiveSection` hook consumed by both controls so Contents and the navigator stay synchronized from one source of truth.
- **Rationale:** Every article already renders through this single route, so new markdown posts inherit the feature automatically; sharing the section hook prevents divergent heading parsing.
- **Alternatives considered:** A per-article component import (rejected: violates the global-system requirement and future-article compatibility); duplicating heading extraction in the navigator (rejected: competing section sources).
- **Trade-offs and consequences:** Progress is measured against the article element with a `ResizeObserver`, so dynamic content stays accurate; the component is client-only and cleans up its listeners, observer, and animation frames on unmount.
- **Evidence and code references:** [`src/app/writings/[slug]/page.tsx`](../src/app/writings/[slug]/page.tsx), [`src/components/ReadingProgressNavigator.tsx`](../src/components/ReadingProgressNavigator.tsx), [`src/hooks/useActiveSection.ts`](../src/hooks/useActiveSection.ts), [`src/components/ArticleToc.tsx`](../src/components/ArticleToc.tsx), and `globals.css` ("Reading progress navigator").
- **Revisit conditions:** Revisit if articles ever stop sharing the `[slug]` route or if the heading extraction rules in `extractHeadings.ts` change.

## DEC-004 — Experience section as vintage admission tickets

- **Status:** Accepted
- **Basis:** User requirement; repository evidence
- **Context:** The Experience section needed a redesign into oversized horizontal vintage admission-ticket cards using the three supplied artwork images in `public/assets/experience/`.
- **Decision:** Render each experience as one `.ticket` element in `src/components/Experience.tsx` with three regions — artwork panel, editorial info body, barcode stub. The ticket silhouette (semicircular notches at the perforation and side edges) is a CSS `mask` on the ticket so the notches cut through the border and the hard offset shadow; the perforation is a repeating-gradient pseudo-element; barcodes are deterministic inline SVGs seeded from the company name. Ticket styles live in `globals.css` under "Experience admission tickets" and collapse to a stacked layout below 768px.
- **Rationale:** A mask-based silhouette keeps the cutouts physically believable (shadow included) with no extra libraries or JavaScript; deterministic seeded barcodes give each ticket a distinct, stable pattern; reusing the existing Bebas/Plex Mono tokens and brutalist shadow keeps the section native to the portfolio.
- **Alternatives considered:** `clip-path` (rejected: clips the border/shadow into a broken outline); background-colored pseudo-element circles (rejected: would not cut the offset shadow); stock barcode libraries (rejected: unnecessary dependency for a non-scannable visual).
- **Trade-offs and consequences:** The notch positions depend on the `--stub-w`/`--stub-h` CSS variables, so stub sizing must change through those variables; hover motion is disabled under `prefers-reduced-motion`.
- **Evidence and code references:** [`src/components/Experience.tsx`](../src/components/Experience.tsx), [`src/data/experience.ts`](../src/data/experience.ts), `globals.css` ("Experience admission tickets"), and [`public/assets/experience/`](../public/assets/experience/).
- **Revisit conditions:** Revisit if the stub width/height variables change or if scannable barcodes are ever required.

## DEC-005 — Thick screen-printed outline with stroked semicircular notches

- **Status:** Accepted
- **Basis:** User requirement; rendered-screenshot evidence
- **Context:** The ticket borders read as thin 1px-style UI strokes and the cutouts looked like plain circular gaps without a perimeter stroke following the curve.
- **Decision:** Raised the ticket border to a `--ticket-stroke` variable (4px desktop, 3px below 768px). The notches are pure mask cutouts with no stroke around the curves — the border exists only on the straight perimeter, and the mask cuts the fill, border, and offset shadow so each notch exposes the page background as a clean semicircular bite. (An earlier SVG ring overlay that stroked the curves was removed per user direction.)
- **Rationale:** The mask continues to cut the fill and offset shadow into genuine cutouts; the SVG circles supply the curved perimeter stroke that CSS borders cannot follow. One stroke variable keeps the straight and curved strokes identical.
- **Alternatives considered:** A fully JS-measured SVG perimeter path (rejected: unnecessary JavaScript for purely visual geometry); overlapping pseudo-element circles (rejected: visible seams at the tangent points).
- **Trade-offs and consequences:** Notch ring radius derives from `--notch` and `--ticket-stroke`, so both must change together; verified at desktop width in a rendered screenshot.
- **Evidence and code references:** [`src/components/Experience.tsx`](../src/components/Experience.tsx) and `globals.css` ("Experience admission tickets").
- **Revisit conditions:** Revisit if `--notch` or `--ticket-stroke` change or if the stub variables move the perforation.

## DEC-006 — Single-bundler rule: Turbopack everywhere, `.next` is disposable

- **Status:** Accepted
- **Basis:** Incident investigation (2026-11-05 engineering audit)
- **Context:** Recurring runtime failures — React Client Manifest "Could not find module ... global-error.js", `__webpack_require__.C is not a function`, and missing `./vendor-chunks/next.js` — traced to `.next` containing interleaved Webpack and Turbopack artifacts. A stale `next dev` (Webpack) process was running on port 3100 alongside `--turbopack` scripts, and each bundler rewrote the other's server runtime, leaving manifests and vendor chunks referencing files that no longer existed. The project also lives under OneDrive, which can lock or partially sync files inside `.next`.
- **Decision:** Standardize on Turbopack for both `dev` and `build` (already the case in `package.json`); treat `.next` as fully disposable — always `rm -rf .next` after switching bundlers, after killing a dev server, or when any manifest/vendor-chunk error appears; never run Webpack and Turbopack servers against the same `.next`; never run `next start` against a `.next` last written by `next dev`.
- **Rationale:** The errors were never application-code bugs; they were corrupted generated artifacts. A clean Turbopack build + clean dev run + clean production start all pass with zero errors, confirming the diagnosis.
- **Trade-offs and consequences:** Developers must not launch `next dev` without `--turbopack`; if Webpack is ever wanted, `.next` must be cleared first. OneDrive sync of `.next` remains an environmental risk (mitigated by it being gitignored and disposable).
- **Evidence and code references:** `package.json` scripts, `next.config.ts` (no custom webpack config), clean-build and smoke-test results from the 2026-11-05 audit.
- **Revisit conditions:** Revisit if the project migrates to a custom Webpack config or a different bundler.
