# Tasks: Sidebar + Screen Header Shell

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~825 (context ~140, AppShell ~110, Sidebar ~200, NavItem ~40, SpaceSwitcher ~120, ScreenHeader ~150, nav-items ~30, wiring + screens ~35) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation + Shell (context, AppShell, routing, layout) → PR 2: Navigation + Header + Screen updates |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | SidebarContext + AppShell + routing fix + layout wiring | PR 1 | Base: main; independently shippable shell without nav |
| 2 | Sidebar (NavItem + SpaceSwitcher) + ScreenHeader + screen updates | PR 2 | Base: PR 1 branch; completes visual navigation |

---

## Phase 1: Foundation — Context + Config

- [ ] 1.1 **[RED]** Write failing test for `SidebarProvider` and `useSidebar()` — assert context throws outside provider, `collapsed` defaults to `false`, `toggleCollapsed` flips state, `drawerOpen` defaults to `false`. File: `src/shared/presentation/components/sidebar/sidebar.context.test.tsx`
- [ ] 1.2 **[GREEN]** Create `src/shared/presentation/components/sidebar/sidebar.context.tsx` — implement `SidebarContext`, `SidebarProvider` (ephemeral `drawerOpen`, `collapsed` persisted to `localStorage` key `gardenia.sidebarCollapsed`), and `useSidebar()` hook. Satisfies CAP-2 (collapse persist + drawer state).
- [ ] 1.3 **[REFACTOR]** Extract localStorage read/write into a `usePersisted` utility if duplicated; ensure SSR safety (guard `typeof window !== 'undefined'`).
- [ ] 1.4 Create `src/shared/presentation/components/sidebar/nav-items.ts` — export `NAV_ITEMS: NavItem[]` with at minimum a "Spaces" entry (`href: '/[lang]/spaces'`, `icon: <LayoutGrid />` from lucide-react). No test required (static config).

## Phase 2: AppShell

- [ ] 2.1 **[RED]** Write failing test for `AppShell` — assert `children` render inside a `<main>`, sidebar region is present, grid CSS var `--sidebar-width` is applied. File: `src/shared/presentation/components/app-shell/app-shell.test.tsx`
- [ ] 2.2 **[GREEN]** Create `src/shared/presentation/components/app-shell/app-shell.tsx` — CSS Grid `grid-cols-[var(--sidebar-width)_1fr] h-screen`, inline style binding `--sidebar-width` to `collapsed ? '64px' : '240px'` from `useSidebar()`. Renders `<Sidebar>` + `<main className="overflow-y-auto">`. Satisfies CAP-1 (two-column layout, children projection).
- [ ] 2.3 **[REFACTOR]** Confirm transition `transition-[grid-template-columns]` applied; verify `<Sidebar>` does NOT unmount on child navigation (layout semantics).

## Phase 3: Routing + Layout Wiring

- [ ] 3.1 Move `app/[lang]/spaces/new/page.tsx` → `app/[lang]/(protected)/spaces/new/page.tsx`. URL stays `/{lang}/spaces/new`. Satisfies CAP-4 (spaces/new under protected group + auth guard).
- [ ] 3.2 Modify `app/[lang]/(protected)/layout.tsx` — wrap `<ProtectedProviders>` contents with `<SidebarProvider><AppShell lang={locale}>`. Import both components. Satisfies CAP-1 (protected layout renders AppShell).

## Phase 4: Sidebar Component (NavItem + SpaceSwitcher)

- [ ] 4.1 Create `src/shared/presentation/components/sidebar/nav-item.tsx` — renders a single `<Link>` with icon + label. Accepts `item: NavItem`, `collapsed: boolean`, `active: boolean`, `onClick?: () => void`. Active state: `bg-[var(--forest-bg)] text-[var(--forest)]`. Collapsed: label `overflow-hidden whitespace-nowrap` (NOT unmounted). No dedicated test (covered by Sidebar tests).
- [ ] 4.2 **[RED]** Write failing tests for `SpaceSwitcher` — assert current space name renders, list of spaces renders (mock `useSpaces` + `useSpacesStore`). File: `src/shared/presentation/components/sidebar/space-switcher.test.tsx`
- [ ] 4.3 **[GREEN]** Create `src/shared/presentation/components/sidebar/space-switcher.tsx` — reads `useSpaces()` + `useSpacesStore` (same hooks as `SpacesListScreen`). Displays current space name. Satisfies CAP-2 (SpaceSwitcher section).
- [ ] 4.4 **[RED]** Write failing tests for `Sidebar` — assert: (a) nav items render in expanded state with icons AND labels, (b) toggle hides labels, (c) active item has forest classes for current route, (d) Escape key calls `closeDrawer`, (e) overlay click calls `closeDrawer`, (f) hamburger hidden on `lg+`, visible on mobile (className guard). File: `src/shared/presentation/components/sidebar/sidebar.test.tsx`
- [ ] 4.5 **[GREEN]** Create `src/shared/presentation/components/sidebar/sidebar.tsx` — renders `NAV_ITEMS` via `<NavItem>`, uses `usePathname()` for active detection, renders mobile drawer (`fixed inset-y-0 left-0 z-40` + translate) + overlay (`fixed inset-0 bg-[var(--ink)]/40`), Escape key `useEffect` listener, collapse toggle button. Accepts `lang: string`. Satisfies CAP-2 (all sidebar requirements).
- [ ] 4.6 **[REFACTOR]** Confirm collapsed labels are readable by screen readers (aria-label on NavItem link); confirm overlay `aria-hidden`.

## Phase 5: ScreenHeader

- [ ] 5.1 **[RED]** Write failing tests for `ScreenHeader` — assert: (a) title renders as heading with serif class, (b) breadcrumbs render when passed (linked item is `<a>`, last item is plain text), (c) no breadcrumbs when omitted, (d) actions render right-aligned when passed, (e) no actions area when omitted. File: `src/shared/presentation/components/screen-header/screen-header.test.tsx`
- [ ] 5.2 **[GREEN]** Create `src/shared/presentation/components/screen-header/screen-header.tsx` — accepts `{ title: string; breadcrumbs?: { label: string; href?: string }[]; actions?: ReactNode }`. Renders horizontal bar: title (serif headline token), optional breadcrumb trail, optional right-aligned actions slot. Satisfies CAP-3 (all ScreenHeader requirements).
- [ ] 5.3 **[REFACTOR]** Validate breadcrumb separator rendered via CSS (not extra DOM nodes); confirm `actions` slot has `ml-auto` or equivalent for right-alignment.

## Phase 6: Screen Layout Updates

- [ ] 6.1 Modify `src/core/spaces/presentation/screens/spaces-list/spaces-list.screen.tsx` — remove `max-w-2xl mx-auto` from root div; add `<ScreenHeader title={dict.title} actions={<Button ...>}/>` replacing inline h1 + button. Satisfies CAP-5 (SpacesListScreen fills content area) + CAP-3 (header usage).
- [ ] 6.2 Modify `src/core/spaces/presentation/screens/space-create/space-create.screen.tsx` — replace `flex min-h-screen items-center justify-center` wrapper with plain `<div className="p-6">`; add `<ScreenHeader title={dict.title} />` at top. Satisfies CAP-5 (SpaceCreateScreen fills content area) + CAP-3.
- [ ] 6.3 Update existing screen tests (if any) to match new markup: `ScreenHeader` present, `min-h-screen` absent. Satisfies CAP-5 spec scenarios.
