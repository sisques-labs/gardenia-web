# Design: Gardenia Design Tokens Integration

## Chosen architecture (HOW, architectural level)

**Layered, one-way token cascade with a thin shadcn alias bridge.** Four layers, strict downward dependency, no cycles:

```
Layer 1  theme.css      @theme  → Tailwind generates bg-*/text-*/border-*/font-* utils  (CANONICAL source of truth)
Layer 2  palettes.css   body.palette-dark / palette-pastel / html.dark body  → OVERRIDE Gardenia raw vars
Layer 3  components.css @layer components  → editorial utility classes consuming Gardenia vars
Layer 4  globals.css    import chain + @layer base shadcn bridge  → shadcn vars ALIAS Gardenia vars
```

Dependency direction is one-way: **Gardenia tokens are the source of truth; shadcn semantic vars are aliases pointing back at them.** Because shadcn vars reference `var(--paper)` etc. (not literal colors), every palette override at Layer 2 automatically flows through to shadcn components with zero extra mapping. This is the load-bearing decision — it is why dark/pastel "just work" for shadcn without duplicating the bridge per palette.

## Component / file map

- `src/design-system/theme.css` — `@theme { --color-*, --font-* }` block ONLY. In Tailwind v4, `@theme` both registers the design token AND emits a `:root` custom property, so a separate `:root` is NOT needed for these tokens. Raw `var(--paper)` access works because `@theme` exposes them as real CSS custom properties.
- `src/design-system/palettes.css` — `body.palette-dark`, `body.palette-pastel`, and the `html.dark body` bridge. Dark overrides + bridge share ONE selector list.
- `src/design-system/components.css` — `@layer components { ... }` editorial classes.
- `app/globals.css` — import chain + `@layer base` shadcn bridge + `body` base styles.
- `app/layout.tsx` — 4 `next/font/google` fonts wired as CSS vars on `<html>`.

Import order in globals.css (ORDER MATTERS):
```css
@import "tailwindcss";
@import "../src/design-system/theme.css";
@import "../src/design-system/palettes.css";
@import "../src/design-system/components.css";
```
(Path is relative to app/globals.css. theme before palettes before components; tailwindcss first so @theme extends it.)

## DECISION 1 — @theme token naming (Tailwind v4)

Colors use `--color-*` namespace → generate `bg-/text-/border-/ring-/fill-` utilities. Multi-word tokens keep hyphens; Tailwind reads each segment, so `--color-forest-bg` => `bg-forest-bg`, `--color-ink-2` => `text-ink-2`, `--color-honey-2` => `bg-honey-2`.

```css
@theme {
  /* paper / ink / rule */
  --color-paper:     oklch(0.96 0.018 80);
  --color-paper-2:   oklch(0.93 0.022 80);
  --color-paper-3:   oklch(0.88 0.028 80);
  --color-ink:       oklch(0.22 0.025 60);
  --color-ink-2:     oklch(0.38 0.03 60);
  --color-ink-3:     oklch(0.55 0.02 60);
  --color-rule:      oklch(0.78 0.03 70);
  --color-white:     oklch(1 0 0);
  /* forest family */
  --color-forest:    oklch(0.42 0.07 145);
  --color-forest-2:  oklch(0.55 0.08 145);
  --color-forest-3:  oklch(0.72 0.07 145);
  --color-forest-bg: oklch(0.92 0.03 140);
  /* accents */
  --color-honey:     oklch(0.74 0.12 75);
  --color-honey-2:   oklch(0.62 0.13 65);
  --color-honey-bg:  oklch(0.94 0.04 75);
  --color-terracotta:oklch(0.62 0.13 35);
  --color-terra-bg:  oklch(0.92 0.04 35);
  --color-sage:      oklch(0.78 0.04 130);
  --color-sage-bg:   oklch(0.94 0.02 130);
  --color-plum:      oklch(0.48 0.08 340);
  --color-sky:       oklch(0.68 0.07 230);
  /* fonts */
  --font-serif: "Newsreader", "Source Serif Pro", Georgia, serif;
  --font-sans:  "DM Sans", -apple-system, "Segoe UI", sans-serif;
  --font-hand:  "Caveat", "Bradley Hand", cursive;
  --font-mono:  "JetBrains Mono", ui-monospace, monospace;
}
```
Resulting utilities incl: bg-paper, bg-paper-2, text-ink, text-ink-2, text-ink-3, border-rule, bg-forest, text-forest, bg-forest-bg, bg-honey, bg-honey-bg, bg-terracotta, bg-terra-bg, bg-sage, bg-sage-bg, font-serif, font-sans, font-hand, font-mono.

NOTE: when next/font is wired, the @theme font values get overridden in layout via the font CSS vars (see DECISION 3). The @theme keeps the literal family stack as a fallback; the actual loaded font is injected through `--font-*` overrides on <html>. To make next/font authoritative, theme.css references the font vars:
`--font-sans: var(--font-dm-sans), -apple-system, "Segoe UI", sans-serif;` etc. (final form in DECISION 3).

## DECISION 2 — shadcn semantic var bridge (COMPLETE, verified)

Placed in `app/globals.css` `@layer base { :root { ... } }`. Verified against the ACTUAL vars consumed by button.tsx, card.tsx, input.tsx, badge.tsx (ring, primary[-foreground], destructive[-foreground], input, background, accent[-foreground], secondary[-foreground], card[-foreground], muted-foreground, border, foreground).

| shadcn var | value | rationale / contrast |
|---|---|---|
| --background | var(--paper) | page bg |
| --foreground | var(--ink) | ink on paper, high contrast |
| --card | var(--paper) | matches Gardenia .card uses paper in light; flat with bg |
| --card-foreground | var(--ink) | |
| --popover | var(--paper) | |
| --popover-foreground | var(--ink) | |
| --primary | var(--forest) | brand primary |
| --primary-foreground | var(--white) | white on dark forest → AA+ |
| --secondary | var(--paper-2) | subtle raised surface |
| --secondary-foreground | var(--ink-2) | |
| --muted | var(--paper-2) | |
| --muted-foreground | var(--ink-3) | placeholder/secondary text |
| --accent | var(--forest-bg) | hover bg for ghost/outline btn → tinted forest wash |
| --accent-foreground | var(--forest) | forest text on forest-bg wash → on-brand, good contrast |
| --destructive | var(--terracotta) | |
| --destructive-foreground | var(--white) | white on terracotta → AA |
| --border | var(--rule) | |
| --input | var(--rule) | |
| --ring | var(--forest-2) | focus ring, lighter forest for visibility |
| --radius | 0.5rem | shadcn expects --radius; set explicitly |

DECISION on `--accent`: brief proposed `--accent: var(--forest-bg)` + `--accent-foreground: var(--forest)`. An EARLIER proposal draft said `--accent: var(--honey)`. CHOSEN: forest-bg/forest. Reason: ghost/outline buttons use `hover:bg-accent hover:text-accent-foreground`; forest text on the pale forest-bg wash is high-contrast and on-brand, whereas forest text on honey would be muddy/low-contrast. This supersedes the proposal's draft honey mapping.

sidebar-* vars: OUT OF SCOPE (no sidebar shadcn components present). Documented, not defined. Add when a sidebar component is introduced.

## DECISION 3 — fonts via next/font/google

All four exist on Google Fonts. layout.tsx:
```ts
import { Newsreader, DM_Sans, Caveat, JetBrains_Mono } from "next/font/google";
const serif = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], display: "swap" });
const sans  = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], display: "swap" });
const hand  = Caveat({ variable: "--font-caveat", subsets: ["latin"], display: "swap" });
const mono  = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"], display: "swap" });
// <html className={`${serif.variable} ${sans.variable} ${hand.variable} ${mono.variable} ...`}>
```
theme.css references these so Tailwind font utilities use the loaded fonts:
```css
--font-serif: var(--font-newsreader), "Source Serif Pro", Georgia, serif;
--font-sans:  var(--font-dm-sans), -apple-system, "Segoe UI", sans-serif;
--font-hand:  var(--font-caveat), "Bradley Hand", cursive;
--font-mono:  var(--font-jetbrains-mono), ui-monospace, monospace;
```
DM Sans is the default body font (set `body { font-family: var(--font-sans) }`). Remove Geist/Geist_Mono entirely. Drop the boilerplate `--font-geist-*` vars.

## DECISION 4 — dark mode bridge (CHOSEN: Option A, explicit shared selector)

Option A (explicit duplication via shared selector list) chosen. Options B (@apply mixin) rejected — Tailwind v4 plain CSS has no usable mixin for raw custom-prop blocks. Option C (`html.dark body.palette-dark`) rejected — requires BOTH classes, defeats shadcn's standalone `html.dark`.

Implementation in palettes.css — ONE rule block, shared selector list, single source of dark values:
```css
body.palette-dark,
body.palette-dark .paper-grain,
html.dark body,
html.dark body .paper-grain {
  --paper: oklch(0.20 0.018 80);
  --paper-2: oklch(0.24 0.022 80);
  /* ... full dark palette ... */
}
```
The shadcn bridge in globals.css aliases shadcn vars to these Gardenia vars, so when `html.dark` is set (next-themes/shadcn convention) OR `body.palette-dark` (Gardenia toggle), the same overrides fire and propagate to shadcn components. Maintenance coupling documented inline with a comment. This is the single deliberate divergence-with-compatibility decision (per proposal risk).

## DECISION 5 — file structure: CONFIRMED 4-file split (3 design-system + globals)

As listed in component map. No `:root` literal block for Gardenia tokens (v4 @theme handles it). globals.css owns: import chain, @layer base shadcn bridge + --radius, body base (bg/color/font-family). Boilerplate light/dark `:root` blocks and `@media prefers-color-scheme` REMOVED (replaced by palette/class-driven dark).

## Integration points
- layout.tsx <html> className: 4 font .variable classes + existing `h-full antialiased`. Body keeps `min-h-full flex flex-col`.
- Providers (next-themes if present) must toggle `html.dark`; Gardenia toggle toggles `body.palette-dark`. Both paths covered by the shared selector.
- cn() / cva variants in existing components unchanged — they resolve correctly once vars exist.

## Risks / unresolved
- Dark bridge selector list must stay in sync (single block mitigates).
- 4 Google fonts LCP weight; mitigate via subset + display:swap, self-host later if CWV regress.
- components.json still points at non-existent src/app/globals.css — shadcn CLI stays broken (accepted, out of scope).
- oklch() unsupported on very old browsers (accepted).
- pastel palette also needs the same bridge ONLY via Gardenia-var override (already automatic); no html-level pastel convention needed.

## Out of scope (unchanged from proposal)
Tokens npm package, monorepo/workspace, Expo, components.json fix, restyling/new components.
