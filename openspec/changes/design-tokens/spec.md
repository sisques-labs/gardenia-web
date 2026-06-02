# Design Tokens Specification

## Purpose

Establish Gardenia brand tokens, editorial utility classes, and a shadcn alias bridge so all UI components render with correct, intentional colors and the four brand fonts are loaded — eliminating the live defect of undefined CSS variables.

---

## Requirements

### Requirement: REQ-TOKENS — Gardenia CSS Custom Properties

The system MUST define the following CSS custom properties under `:root` in the final browser output. Each property MUST resolve to a non-empty value in the default (light) theme.

Mandatory set: `--paper`, `--paper-2`, `--paper-3`, `--ink`, `--ink-2`, `--ink-3`, `--rule`, `--forest`, `--forest-2`, `--forest-3`, `--forest-bg`, `--honey`, `--honey-2`, `--terracotta`, `--sage`, `--plum`, `--sky`, `--serif`, `--sans`, `--hand`, `--mono`.

#### Scenario: Default token resolution

- GIVEN the app is loaded with no class applied to `<html>` or `<body>`
- WHEN the browser computes styles for `:root`
- THEN every property in the mandatory set resolves to a non-empty value
- AND values use `oklch()` color notation or valid CSS font-family strings

#### Scenario: Token source of truth

- GIVEN `src/design-system/theme.css` is the canonical token file
- WHEN the file is parsed
- THEN all mandatory tokens are defined within a `@theme` block or `:root` rule in that file
- AND no mandatory token is defined exclusively inside a component or utility file

---

### Requirement: REQ-TW-UTILS — Tailwind Utility Generation

The system MUST generate Tailwind utility classes for all Gardenia color tokens via `@theme`. At minimum: `bg-paper`, `text-ink`, `bg-forest`, `text-forest`, `bg-honey`, `text-terracotta`, `bg-sage`, `bg-sky`, `bg-plum`.

#### Scenario: Color utilities available

- GIVEN `src/design-system/theme.css` declares `@theme` with `--color-paper`, `--color-forest`, etc.
- WHEN Tailwind v4 processes the CSS
- THEN `bg-paper`, `text-ink`, `bg-forest`, `text-forest`, `bg-honey`, `text-terracotta`, `bg-sage`, `bg-sky`, `bg-plum` are valid class names in any component
- AND no build error is emitted for those class names

#### Scenario: Utilities usable via raw var

- GIVEN a component applies `bg-paper` via Tailwind class
- WHEN the component applies `var(--paper)` directly in inline CSS
- THEN both resolve to the same computed color value

---

### Requirement: REQ-SHADCN-BRIDGE — shadcn Semantic Variable Bridge

The system MUST define every shadcn semantic CSS variable as an alias pointing to a Gardenia token. The full required set: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--destructive-foreground`, `--border`, `--input`, `--ring`, `--card`, `--card-foreground`.

All vars MUST resolve to non-empty values in both light and dark modes.

#### Scenario: Light mode bridge

- GIVEN the app is loaded with no dark class on `<html>`
- WHEN the browser computes `--background`, `--primary`, `--card`, `--border`, `--input`, `--ring`, `--muted`, `--destructive`
- THEN each resolves to a non-empty color derived from a Gardenia token
- AND no shadcn component reports a transparent or missing background color

#### Scenario: Dark mode bridge

- GIVEN `class="dark"` is applied to `<html>`
- WHEN the browser computes the same shadcn vars
- THEN each resolves to a non-empty color appropriate for the dark palette

#### Scenario: Bridge defined in globals.css

- GIVEN `app/globals.css` is parsed
- WHEN the `@layer base` block is read
- THEN all required shadcn vars are defined there as `var(--gardenia-token)` aliases
- AND no shadcn var is hardcoded to a raw color value (always an alias)

---

### Requirement: REQ-PALETTES — Palette Overrides

The system MUST support two named palettes applied via body class. Applying `class="palette-dark"` to `<body>` MUST override Gardenia token values to the dark palette. Applying `class="palette-pastel"` to `<body>` MUST override to the pastel palette.

#### Scenario: Dark palette override

- GIVEN the default light theme is active
- WHEN `palette-dark` class is added to `<body>`
- THEN `--paper`, `--ink`, `--forest`, and other color tokens resolve to their dark-palette values
- AND shadcn vars follow automatically through the alias chain (no additional override needed)

#### Scenario: Pastel palette override

- GIVEN the default light theme is active
- WHEN `palette-pastel` class is added to `<body>`
- THEN `--paper`, `--ink`, `--forest`, and other color tokens resolve to their pastel-palette values
- AND shadcn vars follow automatically

#### Scenario: Palette removal restores defaults

- GIVEN `palette-dark` is active on `<body>`
- WHEN the class is removed
- THEN all tokens revert to their default light values

---

### Requirement: REQ-DARK-BRIDGE — html.dark → palette-dark Equivalence

The system MUST ensure that applying `class="dark"` to `<html>` produces the same visual result as `body.palette-dark`. The bridge MUST be implemented such that both selectors share the same token override declarations (no duplication that can drift).

#### Scenario: html.dark visual parity

- GIVEN `class="dark"` is on `<html>` and no class is on `<body>`
- WHEN the browser computes color tokens
- THEN all Gardenia tokens resolve to the same values they would under `body.palette-dark`

#### Scenario: Shared selector rule — no drift

- GIVEN `src/design-system/palettes.css` is parsed
- WHEN the dark overrides are located
- THEN the selectors `body.palette-dark` and `html.dark body` appear in the SAME rule block or reference the same CSS custom property declarations
- AND a comment explains the coupling

---

### Requirement: REQ-FONTS — Brand Font Loading

The system MUST load four brand fonts via `next/font/google`: Newsreader (serif), DM Sans (sans), Caveat (hand), JetBrains Mono (mono). Each MUST be injected as a CSS variable on `:root`: `--font-serif`, `--font-sans`, `--font-hand`, `--font-mono`. Tailwind `@theme` MUST expose them as `--font-*` to generate `font-serif`, `font-sans`, `font-hand`, `font-mono` utilities.

#### Scenario: Font variables on root

- GIVEN `app/layout.tsx` loads the four fonts via `next/font/google`
- WHEN the document is rendered
- THEN `--font-serif`, `--font-sans`, `--font-hand`, `--font-mono` are defined on `:root`
- AND each resolves to a valid font-family string

#### Scenario: Geist fonts removed

- GIVEN the previous layout used Geist and Geist_Mono
- WHEN `app/layout.tsx` is read after the change
- THEN no import of `geist` or `Geist` appears in the file

#### Scenario: Tailwind font utilities

- GIVEN `@theme` maps `--font-serif` etc.
- WHEN a component applies `font-serif` class
- THEN the computed `font-family` matches the Newsreader font stack

---

### Requirement: REQ-UTILITIES — Editorial Utility Classes

The system MUST define the following CSS class names in `src/design-system/components.css` under `@layer components`, and each MUST apply a non-empty visual style: `.paper-grain`, `.card`, `.chip`, `.chip.forest`, `.chip.honey`, `.chip.terra`, `.chip.sage`, `.dashed-rule`, `.headline`, `.eyebrow`, `.hand-underline`, `.hand-circle`, `.bullet-leaf`, `.cbox`, `.cbox.done`, `.dot`, `.dot-good`, `.dot-warn`, `.dot-bad`, `.tnum`.

#### Scenario: Classes exist and apply styles

- GIVEN `src/design-system/components.css` is parsed
- WHEN each class name in the required set is inspected
- THEN a matching CSS rule exists with at least one declaration
- AND no class in the set resolves to zero applied declarations on a matching element

#### Scenario: Classes use Gardenia tokens

- GIVEN a `.chip.forest` element is rendered
- WHEN computed styles are inspected
- THEN its background/color resolve via `var(--forest)` or `var(--forest-bg)` rather than hardcoded raw values
- AND the same token-reference pattern applies to `.chip.honey`, `.chip.terra`, `.chip.sage`

---

### Requirement: REQ-IMPORT-ORDER — globals.css Import Chain

The system MUST import design-system files in `app/globals.css` in this strict order: `tailwindcss` → `theme.css` → `palettes.css` → `components.css`. The `@layer base` shadcn bridge MUST appear AFTER all imports.

#### Scenario: Import order is correct

- GIVEN `app/globals.css` is parsed top-to-bottom
- WHEN `@import` statements are read
- THEN `tailwindcss` appears before `theme.css`, `theme.css` before `palettes.css`, `palettes.css` before `components.css`
- AND the `@layer base` block appears after all four imports

#### Scenario: No circular imports

- GIVEN theme.css, palettes.css, components.css each exist
- WHEN each file is parsed for `@import` directives
- THEN none of them imports `globals.css` or each other

---

### Requirement: REQ-NO-REGRESSIONS — Existing shadcn Component Integrity

Existing shadcn components (`Button`, `Input`, `Card`, and any others present in `src/shared/presentation/components/ui/`) MUST render without TypeScript compilation errors after the change is applied. No existing component file MUST be modified as part of this change.

#### Scenario: TypeScript build passes

- GIVEN the change is fully applied
- WHEN `tsc --noEmit` is run
- THEN exit code is 0 and no errors reference any file under `src/shared/presentation/components/ui/`

#### Scenario: No component source changes

- GIVEN a git diff of the change
- WHEN files under `src/shared/presentation/components/ui/` are inspected
- THEN no file in that directory has been modified, added, or deleted by this change
