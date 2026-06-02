# Proposal: Gardenia Design Tokens Integration

## Intent

**Problem.** The shadcn/ui components in `src/shared/presentation/components/ui/` reference semantic CSS variables (`--background`, `--primary`, `--card`, `--input`, `--ring`, `--muted-foreground`, `--accent`, `--destructive`) that are NOT defined anywhere in `app/globals.css`. They resolve to nothing, so every shadcn component is rendering with missing/broken colors RIGHT NOW. Separately, the Gardenia brand identity (paper/ink/forest palette, Newsreader/DM Sans/Caveat/JetBrains Mono fonts, editorial utility classes) does not exist in the live project at all — `app/layout.tsx` still loads the Next.js boilerplate Geist fonts.

**Why now.** This is not cosmetic polish; it is a live defect plus a foundational gap. The UI is visibly broken AND the product has no visual identity. Both are blockers for any further presentation-layer work, and every new screen built before this lands inherits the breakage and will need rework.

**Success looks like.**
1. Every existing shadcn component renders with correct, intentional Gardenia colors (no undefined CSS vars).
2. Gardenia brand tokens (colors, fonts, editorial utilities) are loaded and usable as both Tailwind utilities (`bg-paper`, `text-ink`, `text-forest`) and raw CSS vars (`var(--paper)`).
3. The four brand fonts are loaded via `next/font` and wired as CSS variables.
4. Dark mode works through BOTH the Gardenia toggle (`body.palette-dark`) and shadcn's convention (`html.dark`).
5. A single, documented source of truth for tokens lives in `src/design-system/`.

## Scope

### In scope
1. `src/design-system/theme.css` — Tailwind v4 `@theme` block exposing all Gardenia tokens as `--color-*` / `--font-*` (auto-generates `bg-paper`, `text-ink`, `bg-forest`, etc.), plus `:root` fallback vars for non-Tailwind consumers.
2. `src/design-system/palettes.css` — `body.palette-dark` and `body.palette-pastel` overrides.
3. `src/design-system/components.css` — `@layer components` with all editorial utility classes (`.paper-grain`, `.card`, `.chip`, `.headline`, `.eyebrow`, `.dashed-rule`, `.hand-underline`, `.hand-circle`, `.bullet-leaf`, `.cbox`, `.dot-good/warn/bad`, `.tnum`).
4. `app/globals.css` — `@import` chain (`tailwindcss` → theme → palettes → components) plus an `@layer base` shadcn bridge: define every shadcn semantic var as a Gardenia alias (`--background: var(--paper)`, `--primary: var(--forest)`, `--primary-foreground: oklch(1 0 0)`, `--card: var(--paper-2)`, `--ring: var(--forest-2)`, etc.).
5. `app/layout.tsx` — replace Geist/Geist_Mono with Newsreader, DM Sans, Caveat, JetBrains Mono via `next/font/google`, injected as CSS vars.
6. Dark mode bridge — `html.dark body { ... }` mirrors `body.palette-dark` so shadcn's standard dark toggle also fires the Gardenia dark palette.

### Out of scope
- Shared/portable tokens package (`@gardenia/tokens`).
- pnpm workspace / monorepo / Turborepo setup.
- Any Expo / React Native app.
- Fixing or recreating `components.json` for the shadcn CLI (manual-only shadcn install remains the convention).
- Redesigning or restyling existing shadcn components.
- Adding any new UI components.

## Approach

**B + C hybrid with a shadcn bridge layer.** Tailwind v4 `@theme` is the canonical token source (Approach C); tokens are physically organized as three self-contained design-system files imported into `globals.css` (Approach B structure). The dependency direction is one-way: Gardenia tokens are the source of truth, and shadcn's coarser semantic vars are defined as ALIASES pointing back at Gardenia tokens.

**Rationale.** Approach A (flat single-file mapping) is lossy and makes palette switching awkward. Approach D (npm package) is premature — no consumer exists. The hybrid gives maximum expressiveness (native Tailwind utilities for the full Gardenia palette) while keeping shadcn working through a thin, explicit alias layer, and it matches the prior-art scaffold already present in the worktree.

**Token flow.**
`@theme` (theme.css) defines `--color-paper`, `--color-forest`, `--font-serif`, ... → Tailwind generates `bg-paper`/`text-forest`/`font-serif` utilities. `globals.css` `@layer base` maps shadcn vars: `--background: var(--paper)`, `--foreground: var(--ink)`, `--primary: var(--forest)`, `--primary-foreground: oklch(1 0 0)`, `--card: var(--paper-2)`, `--muted: var(--paper-3)`, `--muted-foreground: var(--ink-3)`, `--border: var(--rule)`, `--input: var(--rule)`, `--ring: var(--forest-2)`, `--accent: var(--honey)`, `--destructive: var(--terracotta)`. Palettes override the Gardenia tokens, so shadcn vars follow automatically through the aliases.

**Dark mode bridge.** Primary toggle is `body.palette-dark` (Gardenia convention). To keep shadcn's `html.dark` convention working for any future copy-pasted component, add `html.dark body { ... }` that applies the same token overrides as `body.palette-dark` (or factor the overrides into a shared selector list `body.palette-dark, html.dark body`). This is the single deliberate divergence-with-compatibility decision.

## Deferred decisions
- **Separate tokens repo / `@gardenia/tokens` package.** Explicitly deferred per user decision. Tokens stay in `src/design-system/` inside `gardenia-web`. Revisit by extracting into a pnpm workspace monorepo (with Turborepo) WHEN a `gardenia-mobile` / Expo app is started and there is a real second consumer.
- **`components.json` for shadcn CLI.** Deferred. Manual shadcn install remains the convention until CLI-driven additions are actually needed.

## Risks
- **Dark mode bridge maintenance.** Two selectors (`body.palette-dark` and `html.dark body`) must stay in sync. Future shadcn components added under `.dark` only fire because of the bridge — if the bridge is dropped or refactored carelessly, dark mode silently breaks for new components. Mitigation: define both selectors in one rule block in `palettes.css` with a comment explaining the coupling.
- **4 Google Fonts LCP impact.** Loading Newsreader, DM Sans, Caveat, JetBrains Mono via `next/font/google` adds network/render weight versus the 2 Geist fonts. Mitigation: subset aggressively, set `display: swap`, and consider self-hosting for production if Core Web Vitals regress.
- **No `components.json` fix (manual shadcn only).** The worktree `components.json` points at a non-existent `src/app/globals.css`. We are NOT fixing it; any attempt to use the shadcn CLI to add components will fail until that path is corrected. This is an accepted constraint, documented here so it is not a surprise later.
- **oklch fallback.** Tokens use `oklch()`. Modern browsers support it, but very old browsers will not render these colors. Acceptable for current target audience.

## Non-goals
- Do NOT redesign or restyle existing shadcn components.
- Do NOT add new UI components.
- Do NOT set up a monorepo, pnpm workspace, or Expo app.
- Do NOT fix `components.json` / enable the shadcn CLI in this change.

## Next phases
`sdd-spec` and `sdd-design` can run in parallel from this proposal.
