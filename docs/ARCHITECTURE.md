# Architecture

## System boundary and entry points

The browser enters the application through the Next.js routes in `src/app/`. The home route in [`src/app/page.tsx`](../src/app/page.tsx) composes the portfolio sections and the shared [`Footer`](../src/components/Footer.tsx). Shared visual behavior is implemented by components in `src/components/`; static images are served from `public/` at root-relative URLs.

## Home rendering flow

`src/app/page.tsx` renders `Hero`, `Experience`, `FeaturedProjects`, `Skills`, `Education`, `OtherProjects`, and `Footer` in order inside the existing bounded page container. `OtherProjects` maps `otherProjects` from `src/data/projects.ts` into the project descriptions. The footer then renders the navigation links and visitor count from site data and the visitor component.

## Global footer character flow

The root layout mounts exactly one client-side `MaleHunter` after the active route content. The component observes the active shared `footer`, positions an absolute rail against its existing top border, and retargets that rail when the pathname or footer changes. This keeps the instance and controller alive during client-side navigation while preserving the home page's existing divider placement and using the equivalent footer divider on other routes.

`MaleHunter` uses refs for its DOM position and frame image and runs one cancellable walking controller. East and west frames are selected in archive order at the supplied 10 FPS; the character moves continuously between the measured rail boundaries and turns around before either edge. A `ResizeObserver` recalculates the footer rail and movement limit. `prefers-reduced-motion` stops movement and leaves a stable directional Idle frame.

The supplied sprite pack uses 120×120 transparent canvases. The component preserves that canvas at the existing responsive pixel size and offsets it so the source ground line meets the footer divider.

## Asset boundary

Only the supplied Male Hunter PNG animation frames are copied into `public/assets/sprites/male-hunter/`, retaining the archive's `Idle`, `Interact`, `Sit`, `Sleep`, and `Walk/<direction>` structure. No external asset or runtime animation library is used.

## Lifecycle and failure behavior

The animation is client-only because it needs browser timers, media-query state, image updates, and `ResizeObserver`. If the browser does not provide `ResizeObserver`, the initial measured rail width remains usable and the window resize listener still recalculates it. Effect cleanup cancels the scheduled behavior, frame updates, observer, and media-query listener. Static image loading errors follow normal browser image behavior; no network fallback is defined.
