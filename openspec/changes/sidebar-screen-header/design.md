# Design: Sidebar + Screen Header Shell

## Technical Approach

Approach C (Hybrid). `(protected)/layout.tsx` renders `<AppShell>` once so the
sidebar persists across protected navigations (App Router layout semantics).
`<ScreenHeader>` stays a standalone shared component each page composes. Sidebar
supports collapse (icons-only) on desktop and a drawer (slide-in + overlay) on
mobile. State that must survive navigation lives in a `SidebarProvider` (React
context) with `localStorage` persistence for the collapsed flag only. Styling
uses existing tokens (`--paper`, `--rule`, `--ink`, `--forest`) via Tailwind
arbitrary values and `.paper-grain` / `.dashed-rule` utilities.

## Architecture Decisions

### Decision: Collapse + drawer state ownership

| Option | Tradeoff | Decision |
|--------|----------|----------|
| useState in AppShell, drill props | Simple, but every consumer needs props | Rejected |
| useState in Sidebar (self-contained) | No drilling, but header/content cannot read state | Rejected |
| `SidebarContext` provider | Any child reads/toggles; slight boilerplate | **Chosen** |

**Rationale**: collapse affects layout grid (AppShell), the toggle button
(Sidebar), and potentially the header. Context avoids drilling and keeps a
single source of truth. `collapsed` persists to `localStorage`
(`gardenia.sidebarCollapsed`) matching the existing zustand-persist convention;
`drawerOpen` is ephemeral (resets each load).

### Decision: Layout primitive

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Flexbox row | Simple, width animates via flex-basis | Rejected |
| CSS Grid `[var(--sidebar-width)_1fr]` | Declarative columns, clean width swap | **Chosen** |

**Rationale**: grid template column driven by `--sidebar-width` (240px expanded /
64px collapsed) gives a single transitionable value and keeps main content as
`1fr`. On mobile the sidebar leaves the grid (fixed-positioned drawer) and the
grid collapses to a single `1fr` column.

### Decision: Nav items source

**Choice**: static config file `sidebar/nav-items.ts` exporting `NavItem[]`,
consumed directly by `Sidebar` (not drilled through AppShell).
**Alternatives**: hardcoded JSX (not reusable/testable); prop from layout
(needless indirection for a static list).
**Rationale**: config is testable and i18n-ready without prop plumbing.

### Decision: SpaceSwitcher data source

**Choice**: reads existing `useSpaces()` hook + `useSpacesStore` directly (same
as `SpacesListScreen`). No new props.
**Rationale**: reuse the established spaces presentation layer; avoid duplicating
state. Keeps the switcher self-contained inside the sidebar.

## Data Flow

    SidebarProvider (collapsed*, drawerOpen)  *persisted to localStorage
        │ context
        ▼
    AppShell ──grid[--sidebar-width 1fr]── main → ScreenHeader + page
        │
        └─ Sidebar ── NavItem[] (config) ── SpaceSwitcher
                                                │
                            useSpaces() + useSpacesStore (existing)

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/[lang]/(protected)/layout.tsx` | Modify | Wrap children in `<SidebarProvider><AppShell>` |
| `app/[lang]/spaces/new/page.tsx` | Move | → `app/[lang]/(protected)/spaces/new/page.tsx` (route path unchanged) |
| `src/shared/presentation/components/app-shell/app-shell.tsx` | Create | Grid shell, reads `useSidebar()` |
| `src/shared/presentation/components/app-shell/app-shell.test.tsx` | Create | Renders children in main, sidebar present |
| `src/shared/presentation/components/sidebar/sidebar.tsx` | Create | Nav, collapse toggle, drawer + overlay, Escape-to-close |
| `src/shared/presentation/components/sidebar/sidebar.test.tsx` | Create | Toggle, active highlight, Escape closes drawer |
| `src/shared/presentation/components/sidebar/nav-item.tsx` | Create | Single link row (icon + label, active state) |
| `src/shared/presentation/components/sidebar/space-switcher.tsx` | Create | Current space + list via existing hooks |
| `src/shared/presentation/components/sidebar/space-switcher.test.tsx` | Create | Current space shown, list renders |
| `src/shared/presentation/components/sidebar/nav-items.ts` | Create | Static `NavItem[]` config |
| `src/shared/presentation/components/sidebar/sidebar.context.tsx` | Create | `SidebarProvider` + `useSidebar()` |
| `src/shared/presentation/components/screen-header/screen-header.tsx` | Create | Title + breadcrumbs + actions slot |
| `src/shared/presentation/components/screen-header/screen-header.test.tsx` | Create | Title, breadcrumbs, actions render |
| `src/core/spaces/presentation/screens/spaces-list/spaces-list.screen.tsx` | Modify | Drop `max-w-2xl mx-auto`, adopt ScreenHeader |
| `src/core/spaces/presentation/screens/space-create/space-create.screen.tsx` | Modify | Drop `min-h-screen` centering, adopt ScreenHeader |

## Interfaces / Contracts

```ts
// nav-items.ts
export interface NavItem { label: string; href: string; icon?: ReactNode }

// sidebar.context.tsx
interface SidebarContextValue {
  collapsed: boolean;      // persisted to localStorage
  toggleCollapsed: () => void;
  drawerOpen: boolean;     // ephemeral (mobile)
  openDrawer: () => void;
  closeDrawer: () => void;
}
export function useSidebar(): SidebarContextValue;

// app-shell.tsx
interface AppShellProps { children: ReactNode }

// sidebar.tsx  (reads context + nav-items config; no required props)
interface SidebarProps { lang: string }

// screen-header.tsx
interface ScreenHeaderProps {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}
```

## CSS Layout (non-obvious bits)

```tsx
// AppShell: grid column driven by a CSS var the provider sets
<div
  className="grid h-screen transition-[grid-template-columns] duration-200
             md:grid-cols-[var(--sidebar-width)_1fr] grid-cols-[1fr]"
  style={{ ['--sidebar-width' as string]: collapsed ? '64px' : '240px' }}
>
  <Sidebar lang={lang} />          {/* hidden < md; drawer-fixed when open */}
  <main className="overflow-y-auto paper-grain">{children}</main>
</div>
```

- Labels use `overflow-hidden whitespace-nowrap`; in collapsed state width is
  clamped so labels visually disappear without unmounting (keeps a11y names).
- Mobile sidebar: `fixed inset-y-0 left-0 z-40` + translate transform toggled by
  `drawerOpen`; overlay `fixed inset-0 bg-[var(--ink)]/40` closes on click.
- Active nav item: compare `usePathname()` against `href`, apply
  `bg-[var(--forest-bg)] text-[var(--forest)]`.
- Dividers use `.dashed-rule`; shell surfaces use `--paper` / `--paper-2`.

## Testing Strategy

| Layer | What | Approach (Vitest + RTL, strict TDD) |
|-------|------|------|
| Unit | AppShell | children render in `<main>`, sidebar present |
| Unit | Sidebar | toggle flips collapsed; active item has forest classes; Escape calls `closeDrawer` |
| Unit | ScreenHeader | title heading; breadcrumbs render when passed; actions in right slot |
| Unit | SpaceSwitcher | current space label shown; full list renders (mock `useSpaces`/store) |
| Integration | Provider | `useSidebar` outside provider throws; collapsed persists to localStorage |

Tests authored before implementation (strict TDD). Existing screen tests updated
for ScreenHeader markup and removal of centering wrappers.

## Migration / Rollout

No data migration. Moving `spaces/new` keeps the URL `/{lang}/spaces/new`
identical (only the route-group folder changes) — grep confirms refs use the URL
string, not the file path, so no import updates needed.

## Open Questions

- [ ] Icon source for nav items — lucide-react (shadcn default) vs. inline SVG?
- [ ] Does ScreenHeader own breadcrumb separators, or accept pre-rendered nodes?
