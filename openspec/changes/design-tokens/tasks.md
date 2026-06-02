# Tasks: Gardenia Design Tokens Integration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 280–360 (net new CSS + layout rewrite) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | All 5 file changes (CSS + layout) | PR 1 | Atomic — all files depend on theme.css being canonical source; ship together |

---

## Phase 1: Foundation — theme.css (REQ-TOKENS, REQ-TW-UTILS, REQ-FONTS)

- [x] 1.1 Create `src/design-system/theme.css` with `@theme { --color-* }` block: all 16 color tokens (paper/paper-2/paper-3, ink/ink-2/ink-3, rule, forest/forest-2/forest-3/forest-bg, honey/honey-2, terracotta, sage, plum, sky) using oklch() notation.
  - Acceptance: open DevTools on any page → `getComputedStyle(document.documentElement).getPropertyValue('--color-paper')` returns a non-empty string.
- [x] 1.2 Add `--font-*` entries to `@theme` in `src/design-system/theme.css`, referencing next/font CSS vars as first item in each stack: `var(--font-newsreader)`, `var(--font-dm-sans)`, `var(--font-caveat)`, `var(--font-jetbrains-mono)`.
  - Acceptance: `@theme` block contains exactly 4 `--font-*` entries, each starting with `var(--font-...)`.

## Phase 2: Palette Overrides — palettes.css (REQ-PALETTES, REQ-DARK-BRIDGE)

- [x] 2.1 Create `src/design-system/palettes.css` with dark palette override block. Shared selector list: `body.palette-dark, html.dark body` (plus `.paper-grain` variants). Override all color tokens to dark oklch values. Include inline comment documenting the coupling.
  - Acceptance: adding `palette-dark` to `<body>` or `dark` to `<html>` both flip `--paper` to the dark value.
- [x] 2.2 Add `body.palette-pastel` rule block to `src/design-system/palettes.css` with pastel palette overrides. No `html`-level bridge needed for pastel.
  - Acceptance: adding `palette-pastel` to `<body>` changes `--paper` and `--forest` to pastel values; removing the class restores defaults.

## Phase 3: Editorial Utilities — components.css (REQ-UTILITIES)

- [x] 3.1 Create `src/design-system/components.css` with `@layer components { }` block. Define all 20 required classes: `.paper-grain`, `.card`, `.chip`, `.chip.forest`, `.chip.honey`, `.chip.terra`, `.chip.sage`, `.dashed-rule`, `.headline`, `.eyebrow`, `.hand-underline`, `.hand-circle`, `.bullet-leaf`, `.cbox`, `.cbox.done`, `.dot`, `.dot-good`, `.dot-warn`, `.dot-bad`, `.tnum`. Color declarations MUST use `var(--forest)`, `var(--honey)`, etc. — no raw color values.
  - Acceptance: each class has at least one CSS declaration; `.chip.forest` background resolves via `var(--forest)` or `var(--forest-bg)`.

## Phase 4: Import Chain + shadcn Bridge — globals.css (REQ-SHADCN-BRIDGE, REQ-IMPORT-ORDER)

- [x] 4.1 Rewrite `app/globals.css`. Import chain (strict order): `@import "tailwindcss"` → `@import "../src/design-system/theme.css"` → `@import "../src/design-system/palettes.css"` → `@import "../src/design-system/components.css"`. Remove all old `:root` Geist/boilerplate blocks.
  - Acceptance: imports appear in this exact order; no `@import` after `@layer base`.
- [x] 4.2 Add `@layer base { :root { ... } }` to `app/globals.css` with the complete shadcn semantic var bridge (17 vars + `--radius: 0.5rem`): --background, --foreground, --card, --card-foreground, --popover, --popover-foreground, --primary, --primary-foreground, --secondary, --secondary-foreground, --muted, --muted-foreground, --accent, --accent-foreground, --destructive, --destructive-foreground, --border, --input, --ring. All values are `var(--gardenia-token)` aliases; no raw colors.
  - Acceptance: `getComputedStyle(document.documentElement).getPropertyValue('--background')` resolves to a non-empty value in both light and dark.
- [x] 4.3 Add `body { font-family: var(--font-sans); background-color: var(--background); color: var(--foreground); }` base styles to `@layer base` in `app/globals.css`.
  - Acceptance: body element has computed `font-family` starting with DM Sans.

## Phase 5: Font Loading — layout.tsx (REQ-FONTS, REQ-NO-REGRESSIONS)

- [x] 5.1 Rewrite `app/layout.tsx`: replace Geist/Geist_Mono imports with `{ Newsreader, DM_Sans, Caveat, JetBrains_Mono }` from `next/font/google`. Each font uses `variable` + `subsets: ["latin"]` + `display: "swap"`. Apply all 4 `.variable` classes to `<html>`. Remove all `--font-geist-*` variable references.
  - Acceptance: no `geist` or `Geist` string remains in the file; `<html>` className includes all 4 font variable class names.
- [x] 5.2 Verify TypeScript compiles after layout.tsx change: `tsc --noEmit` exits 0, no errors under `src/shared/presentation/components/ui/`.
  - Acceptance: zero TS errors; no UI component file was modified.

## Phase 6: Verification

- [ ] 6.1 Check that all mandatory CSS custom properties resolve in browser DevTools (light mode, no classes): paper, paper-2, paper-3, ink, ink-2, ink-3, rule, forest, forest-2, forest-3, forest-bg, honey, honey-2, terracotta, sage, plum, sky — 16 properties non-empty.
- [ ] 6.2 Toggle `class="dark"` on `<html>` and `class="palette-dark"` on `<body>` separately — verify both produce identical computed values for `--paper` and `--ink`. Remove both and confirm revert to light defaults.
- [ ] 6.3 Toggle `class="palette-pastel"` on `<body>` — verify tokens change; remove and confirm revert.
- [ ] 6.4 Spot-check shadcn components (Button, Input, Card): no transparent or missing background in light AND dark mode. No component file under `src/shared/presentation/components/ui/` was modified (git diff check).
- [ ] 6.5 Confirm no circular imports: theme.css, palettes.css, components.css do NOT import globals.css or each other.
