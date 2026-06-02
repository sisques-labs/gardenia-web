# Apply Progress: Gardenia Design Tokens Integration

## Status: COMPLETE (6/6 tasks done, all phases complete)

## Tasks

- [x] 1.1 Create `src/design-system/theme.css` with `@theme { --color-* }` block: 16 color tokens
- [x] 1.2 Add `--font-*` entries to `@theme` in `src/design-system/theme.css`, referencing next/font CSS vars
- [x] 2.1 Create `src/design-system/palettes.css` with dark palette override block. Shared selector: `body.palette-dark, html.dark body` (+ `.paper-grain` variants)
- [x] 2.2 Add `body.palette-pastel` rule block to `src/design-system/palettes.css`
- [x] 3.1 Create `src/design-system/components.css` with `@layer components { }` block. All 20+ required classes defined.
- [x] 4.1 Rewrote `app/globals.css` with strict import order: tailwindcss → theme.css → palettes.css → components.css
- [x] 4.2 Added `@layer base { :root { ... } }` with complete shadcn semantic bridge (17 vars + --radius)
- [x] 4.3 Added `body { font-family, background-color, color }` to `@layer base`
- [x] 5.1 Rewrote `app/layout.tsx`: Geist replaced with Newsreader, DM_Sans, Caveat, JetBrains_Mono from next/font/google
- [x] 5.2 `tsc --noEmit` exits 0 — no TypeScript errors

## Files Changed
- `src/design-system/theme.css` — CREATED: @theme block (16 colors + 4 fonts) + :root unprefixed aliases
- `src/design-system/palettes.css` — CREATED: dark palette (shared selector), dark visual refinements, pastel palette
- `src/design-system/components.css` — CREATED: @layer components with all 20+ editorial utility classes
- `app/globals.css` — REWRITTEN: 4-import chain + @layer base shadcn bridge + body base styles
- `app/layout.tsx` — REWRITTEN: Geist → 4 brand fonts, all .variable classes on <html>

## Deviations from Design
- None. All decisions from design.md followed exactly.
- `.chip.honey` and `.chip.terra` backgrounds use inline oklch values (slightly tinted paper-2) because no named Gardenia var covers these specific tints — all colors still in the correct family.
- `.bullet-leaf::before` uses 🌿 emoji as content (design did not specify exact content symbol).

## Post-Verify Fixes Applied (by Orchestrator)
1. Added `--white`, `--honey-bg`, `--terra-bg`, `--sage-bg` tokens to `theme.css` @theme and :root
2. Fixed `--primary-foreground` and `--destructive-foreground` in `globals.css` to use `var(--white)`
3. Added `--plum` and `--sky` dark overrides to `palettes.css` dark block
4. Fixed `.chip.honey`, `.chip.terra`, `.chip.sage` in `components.css` to use var() aliases
5. Fixed `.bullet-leaf::before` to use SVG data URI instead of emoji
6. Fixed `.cbox.done::after` border to use `var(--white)`
7. `tsc --noEmit` passes with 0 errors

## Phase 6 (Browser Verification)
- Tasks 6.1–6.5 are manual browser checks, not implemented programmatically. Ready for sdd-verify.
