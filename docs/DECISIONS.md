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

## DEC-007 — Command-K finder: server-built index, prop-fed client dialog

- **Status:** Accepted
- **Basis:** Implementation task requirements; repository evidence
- **Context:** The portfolio had no search or discoverable navigation aid. Its content sources are spread across data modules and markdown posts, and two floating widgets (RBSH, BhardwajBot) own their own open state internally.
- **Decision:** Build the finder index once per render in the root layout (server) from the existing data modules and `getAllPosts()`, pass it as props to a single client `CommandPalette` mounted globally, keep scoring in a pure module (`src/lib/finder.ts`), and implement widget-launch actions as programmatic clicks on the existing `[aria-label="Open RBSH terminal"]` / `[aria-label="Open BhardwajBot"]` launcher buttons rather than refactoring those components' state.
- **Rationale:** Importing `posts.ts` (filesystem reads) from client code is impossible, so the index must originate server-side; a ~29-item corpus needs no search dependency and no debounce; launcher-button clicks reuse the widgets' tested open paths with zero coupling to their internals.
- **Alternatives considered:** Lifting RBSH/Bot open-state into a shared context (rejected: invasive refactor of working components for no visitor-visible gain); adding a client-side search dependency (rejected: unnecessary at this corpus size); client-side index duplication (rejected: violates the single-source rule).
- **Trade-offs and consequences:** The serialized index ships in the RSC payload of every route (a few KB); new content types must be added to `buildFinderItems()` to appear in the finder; the dialog introduces the z-index 70 tier between fixed chrome (60) and the lightbox (100).
- **Evidence and code references:** [`src/lib/finder-items.ts`](../src/lib/finder-items.ts), [`src/lib/finder.ts`](../src/lib/finder.ts), [`src/components/CommandPalette.tsx`](../src/components/CommandPalette.tsx), [`src/app/layout.tsx`](../src/app/layout.tsx), and the "Command-K finder" section of `globals.css`.
- **Revisit conditions:** Revisit if the indexed corpus grows by an order of magnitude (then add a build-time index artifact), or if widgets expose public open APIs (then replace the DOM-click bridge).

## DEC-008 - Sitemap, robots, and technical SEO as build-time artifacts with a single origin helper

- **Status:** Accepted (revised 2026-11-06; RSS portions superseded by DEC-009)
- **Basis:** Implementation task requirements (production-grade SEO, security-sensitive change); repository evidence
- **Context:** The sitemap and robots must stay synchronised with the writings without a second content list, must never expose runtime internals, and must emit one canonical production origin everywhere. Search visibility additionally needs consistent metadata and structured data.
- **Decision:** Generate `/sitemap.xml` and `/robots.txt` as `force-static` Next.js metadata routes that read only trusted local content at build time; concentrate origin resolution in `src/lib/site-url.ts` (`getSiteUrl`, `absoluteSiteUrl`); use article frontmatter publication dates as the only `lastModified` source (omitted for undated pages); declare per-page canonical URLs and site/article Open Graph/Twitter metadata using the existing 720x630 `heroBanner.png` as the shared preview image; render structured data through `src/components/JsonLd.tsx` (Person + WebSite `@graph` in the root layout, BlogPosting per article referencing those nodes by `@id`, with `JSON.stringify` output escaped so `</script>` sequences cannot break out of the script tag); render unknown routes through a branded `src/app/not-found.tsx` returning a real 404.
- **Rationale:** Build-time prerendering removes every runtime input path (no query parameters, no filesystem access per request, no outbound fetches), which satisfies the SSRF/injection threat model structurally rather than by filtering; one origin helper prevents the layout, sitemap, and robots from drifting onto different hosts; referencing Person/WebSite by `@id` avoids duplicate or contradictory schema declarations.
- **Alternatives considered:** A dynamic route handler with per-request generation (rejected: pointless filesystem work and a wider input surface for content that changes only at deploy time); an SEO library (rejected: native Next.js metadata routes cover everything); per-article generated OG images (deferred: existing article banner assets are 2-3 MB PNGs, too heavy for share crawlers - the shared heroBanner is the pragmatic choice); BreadcrumbList schema (omitted: article pages show only a back link, and structured data must match visible content).
- **Trade-offs and consequences:** The sitemap regenerates only on deploy - correct for a build-on-publish site; `notes/cpp` and `notes/deep-learning` are client components and cannot export metadata, so they appear in the sitemap without canonical tags (documented limitation); the 720x630 preview image is below the ideal 1200x630 OG size but is an existing, correctly-proportioned asset.
- **Evidence and code references:** [`src/lib/site-url.ts`](../src/lib/site-url.ts), [`src/app/sitemap.ts`](../src/app/sitemap.ts), [`src/app/robots.ts`](../src/app/robots.ts), [`src/components/JsonLd.tsx`](../src/components/JsonLd.tsx), [`src/app/not-found.tsx`](../src/app/not-found.tsx), and the metadata declarations across `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/writings/page.tsx`, `src/app/writings/[slug]/page.tsx`, `src/app/shelf/page.tsx`, and `src/app/notes/page.tsx`.
- **Revisit conditions:** Revisit if articles gain drafts/tags (extend validity filtering), if a lighter per-article preview image strategy becomes available (per-article OG images), or if the deployment origin changes.

## DEC-009 - Remove RSS from the portfolio entirely

- **Status:** Accepted
- **Basis:** Owner decision (2026-11-06)
- **Context:** An RSS 2.0 feed existed at `/feed.xml` (force-static route, builder in `src/lib/rss.ts`, footer link, feed autodiscovery links on every page). The owner decided this portfolio will not provide RSS subscriptions.
- **Decision:** Delete `src/app/feed.xml/` and `src/lib/rss.ts` in full; remove the footer RSS link, the `RSS_ALTERNATE_TYPE` constant and every `alternates.types` autodiscovery declaration, and all RSS references from documentation. Requesting `/feed.xml` now falls through to the shared 404 (real HTTP 404, no redirect, no homepage fallback).
- **Rationale:** An unused subscription channel is surface area without value; removing the constant also removes the per-page `alternates` redeclaration burden that existed solely for autodiscovery.
- **Alternatives considered:** Keeping the endpoint but hiding the link (rejected: dead surface); redirecting `/feed.xml` to the writings index (rejected: the owner requires a 404, not a redirect).
- **Trade-offs and consequences:** Readers who prefer feeds lose that consumption path; `PORTFOLIO_PRODUCT_AUDIT.md` (a historical audit snapshot) still mentions RSS and is intentionally left unedited as a point-in-time record.
- **Evidence and code references:** Deletions: `src/app/feed.xml/route.ts`, `src/lib/rss.ts`; modifications: `src/components/Footer.tsx`, `src/lib/site-url.ts`, `src/app/layout.tsx`, and the five page-level metadata exports; verification: `/feed.xml` returns 404 on the production build and zero RSS references remain under `src/`.
- **Revisit conditions:** Only on a new owner decision to reintroduce syndication.

## DEC-010 - Finder trigger: measured top-right placement, scroll-aware visibility, mobile icon variant

- **Status:** Accepted
- **Basis:** Owner requirements (2026-11-05/06); rendered-browser verification
- **Context:** The finder trigger initially sat at the top-left next to the ThemeToggle, was permanently visible while scrolling, and rendered the full FIND + shortcut button at every viewport. The top-right corner is shared by the resume ribbon (most routes) and the article TOC trigger (article pages, where the ribbon unmounts itself).
- **Decision:** Position the trigger by measuring its top-right neighbour at runtime (`getBoundingClientRect` against `.resume-btn` / `.article-toc-trigger`, re-measured on resize, font load, window load, occupant resize, and route-swap mutations) so it always sits immediately left of that occupant, top-aligned, and takes the corner itself when neither exists. Hide the trigger past a 24px scroll threshold via a single passive scroll listener whose body is one `scrollY` comparison (no rAF scheduling, no re-renders while unchanged); the hidden state (`opacity: 0; visibility: hidden; pointer-events: none`) makes it unclickable and unfocusable, while `prefers-reduced-motion` zeroes the transition. The Ctrl/Cmd+K shortcut lives in a separate listener and works at any scroll position. Below 768px the trigger becomes a 44x44 icon-only button rendering the supplied `public/assets/magnifying-glass.svg` (label and shortcut hidden; dark mode inverts the SVG's near-black stroke via CSS `filter: invert(1)` without touching the asset). Fixed positioning throughout, so no layout shift.
- **Rationale:** Hardcoded offsets cannot survive label/viewport changes across three corner states; measured placement cannot overlap. `window.innerWidth` includes the scrollbar while fixed-position offsets do not, so placement must use `document.documentElement.clientWidth` (a real bug found and fixed during verification). A synchronous O(1) scroll handler is more deterministic than rAF scheduling, which stalls in unfocused/throttled panes.
- **Alternatives considered:** Static per-route offsets (rejected: brittle against content/font changes); hiding the trigger with `display: none` (rejected: abrupt, though it would also remove focusability); rendering two separate mobile/desktop buttons (rejected: one element with responsive CSS keeps a single source of truth); an intersection observer on a sentinel (rejected: heavier than one scrollY comparison for a fixed element).
- **Trade-offs and consequences:** The trigger's inline `top`/`right` override its CSS defaults after hydration (the CSS values are the pre-JS fallback); the supplied SVG's hard-coded `#020202` stroke forces the CSS invert in dark mode rather than `currentColor`; in a fully backgrounded pane the hidden state can lag until frames resume - irrelevant to viewers, since scrolling a visible page always produces frames.
- **Evidence and code references:** [`src/components/CommandPalette.tsx`](../src/components/CommandPalette.tsx) (placement effect, scroll effect, trigger markup), the "Command-K finder" section of `globals.css` (`finder-trigger--hidden`, icon and mobile rules), and `public/assets/magnifying-glass.svg`. Verified at 320/360/375/390/430/1440 widths in both themes: 44x44 square, no horizontal overflow, ticker unobstructed, gap to the occupant 12-13px.
- **Revisit conditions:** Revisit if the header gains new fixed elements at the top-right, if the mobile breakpoint changes, or if the supplied finder asset is replaced (re-check stroke colour and dark-mode treatment).
