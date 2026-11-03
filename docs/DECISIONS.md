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
