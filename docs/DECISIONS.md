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
