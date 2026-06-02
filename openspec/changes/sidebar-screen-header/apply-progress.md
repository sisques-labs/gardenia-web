# Apply Progress: sidebar-screen-header (PR 1 + PR 2 — ALL COMPLETE)

## Status: ALL PHASES COMPLETE

## Phase 1: Foundation — Context + Config [DONE]

- [x] 1.1 [RED] Write failing test for SidebarProvider and useSidebar()
- [x] 1.2 [GREEN] Create sidebar.context.tsx — SidebarContext, SidebarProvider, useSidebar()
- [x] 1.3 [REFACTOR] SSR guard in readPersistedCollapsed/persistCollapsed; no duplication
- [x] 1.4 Create nav-items.ts — NAV_ITEMS with Spaces entry (LayoutGrid icon from lucide-react)

Files created:
- src/shared/presentation/components/sidebar/sidebar.context.tsx
- src/shared/presentation/components/sidebar/sidebar.context.test.tsx
- src/shared/presentation/components/sidebar/nav-items.ts

Tests: 8 passed
Commit: feat(sidebar): add SidebarProvider with collapse + drawer state

## Phase 2: AppShell [DONE]

- [x] 2.1 [RED] Write failing test for AppShell
- [x] 2.2 [GREEN] Create app-shell.tsx — CSS Grid, --sidebar-width inline style, aside + main
- [x] 2.3 [REFACTOR] transition-[grid-template-columns] applied; aside does NOT unmount

Files created:
- src/shared/presentation/components/app-shell/app-shell.tsx
- src/shared/presentation/components/app-shell/app-shell.test.tsx

Tests: 4 passed
Commit: feat(app-shell): add AppShell CSS grid layout component

## Phase 3: Routing + Layout Wiring [DONE]

- [x] 3.1 Moved app/[lang]/spaces/new/page.tsx → app/[lang]/(protected)/spaces/new/page.tsx
- [x] 3.2 Modified app/[lang]/(protected)/layout.tsx — wraps children in SidebarProvider + AppShell

Files modified/created:
- app/[lang]/(protected)/layout.tsx (modified)
- app/[lang]/(protected)/spaces/new/page.tsx (moved from app/[lang]/spaces/new/page.tsx)
- src/shared/presentation/components/app-shell/app-shell-layout.test.tsx (new integration test)

Tests: 2 passed (+ 30 pre-existing = 32 total passing)
Commit: feat(layout): wire AppShell into protected layout + fix spaces/new routing

## Phase 4: Sidebar Component (NavItem + SpaceSwitcher + Sidebar) [DONE]

- [x] 4.1 Create nav-item.tsx — Link with icon + label, collapsed label uses overflow-hidden (NOT unmounted), aria-label on collapsed
- [x] 4.2 [RED] Failing tests for SpaceSwitcher written (space-switcher.test.tsx)
- [x] 4.3 [GREEN] space-switcher.tsx — reads useSpaces() + useSpacesStore, select for multi-space switching
- [x] 4.4 [RED] Failing tests for Sidebar written (sidebar.test.tsx)
- [x] 4.5 [GREEN] sidebar.tsx — NAV_ITEMS, usePathname active, mobile drawer + overlay, Escape useEffect, collapse toggle
- [x] 4.6 [REFACTOR] aria-label on NavItem (collapsed), overlay aria-hidden

AppShell updated to import + render <Sidebar /> inside aside; mobile hamburger Menu button visible below md.
AppShell tests updated to mock Sidebar (avoids react-query dep in unit test).

Files created:
- src/shared/presentation/components/sidebar/nav-item.tsx
- src/shared/presentation/components/sidebar/space-switcher.tsx
- src/shared/presentation/components/sidebar/space-switcher.test.tsx
- src/shared/presentation/components/sidebar/sidebar.tsx
- src/shared/presentation/components/sidebar/sidebar.test.tsx

Files modified:
- src/shared/presentation/components/app-shell/app-shell.tsx (imports Sidebar, adds hamburger)
- src/shared/presentation/components/app-shell/app-shell.test.tsx (mocks Sidebar)
- src/shared/presentation/components/app-shell/app-shell-layout.test.tsx (mocks Sidebar)

Tests: 19 passed (sidebar suite)
Commits:
- feat(sidebar): add NavItem and SpaceSwitcher sub-components
- feat(sidebar): add Sidebar component with collapse and mobile drawer

## Phase 5: ScreenHeader [DONE]

- [x] 5.1 [RED] Failing tests written (screen-header.test.tsx)
- [x] 5.2 [GREEN] screen-header.tsx — title (headline class), optional breadcrumbs (Link if href), optional right-aligned actions (ml-auto)
- [x] 5.3 [REFACTOR] breadcrumb separator via CSS span, actions slot has data-testid + ml-auto

Files created:
- src/shared/presentation/components/screen-header/screen-header.tsx
- src/shared/presentation/components/screen-header/screen-header.test.tsx

Tests: 9 passed
Commit: feat(screen-header): add ScreenHeader component

## Phase 6: Screen Layout Updates [DONE]

- [x] 6.1 spaces-list.screen.tsx — removed max-w-2xl mx-auto, added ScreenHeader with actions slot (New Space button)
- [x] 6.2 space-create.screen.tsx — removed flex min-h-screen items-center justify-center, added ScreenHeader title="New Space"
- [x] 6.3 New screen tests verify ScreenHeader present, centering classes absent

Files modified:
- src/core/spaces/presentation/screens/spaces-list/spaces-list.screen.tsx
- src/core/spaces/presentation/screens/space-create/space-create.screen.tsx

Files created:
- src/core/spaces/presentation/screens/spaces-list/spaces-list.screen.test.tsx
- src/core/spaces/presentation/screens/space-create/space-create.screen.test.tsx

Tests: 8 passed
Commit: feat(screens): integrate AppShell layout into SpacesListScreen and SpaceCreateScreen

## Final test count: 60 passing, 0 failing (was 32 in PR 1)
