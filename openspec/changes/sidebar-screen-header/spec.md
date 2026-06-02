# Spec: sidebar-screen-header

## Summary

| Capability | Requirements | Scenarios | Type |
|------------|-------------|-----------|------|
| CAP-1 AppShell | 3 | 5 | New |
| CAP-2 Sidebar | 9 | 16 | New |
| CAP-3 ScreenHeader | 6 | 10 | New |
| CAP-4 Routing Fix | 2 | 3 | New |
| CAP-5 Screen Layout | 2 | 4 | New |

---

## CAP-1: AppShell Specification

### Purpose

Persistent layout shell that wraps all authenticated screens with sidebar + content area.

### Requirement: Protected Layout Renders AppShell

The `(protected)` layout MUST render `<AppShell>` as the root wrapper for all authenticated child routes.

#### Scenario: Authenticated route renders shell

- GIVEN a user navigates to any route under `(protected)`
- WHEN the layout mounts
- THEN `<AppShell>` is rendered, containing a sidebar area and a main content area

#### Scenario: Auth routes do not render AppShell

- GIVEN a user navigates to a route outside `(protected)` (e.g. `/login`, `/register`)
- WHEN the layout mounts
- THEN `<AppShell>` is NOT rendered

### Requirement: AppShell Two-Column Layout

`<AppShell>` MUST render a two-column layout: a sidebar area on the left and a main content area on the right.

#### Scenario: Layout structure

- GIVEN `<AppShell>` mounts with children
- WHEN inspected
- THEN the sidebar area and main content area are rendered as sibling regions

### Requirement: AppShell Children Projection

`<AppShell>` MUST project its `children` prop into the main content area.

#### Scenario: Children rendered in content area

- GIVEN `<AppShell>` receives a child component
- WHEN it renders
- THEN the child appears inside the main content area, not the sidebar area

#### Scenario: Sidebar is independent of children

- GIVEN `<AppShell>` receives different children per navigation
- WHEN each page mounts
- THEN the sidebar does NOT unmount or re-mount between navigations (persists)

---

## CAP-2: Sidebar Specification

### Purpose

Persistent vertical navigation panel with collapse, mobile drawer, active-route highlighting, and space switching.

### Requirement: Vertical Navigation Panel

The Sidebar MUST render as a vertical panel on the left side of the AppShell.

#### Scenario: Sidebar renders nav items

- GIVEN the Sidebar mounts in expanded state
- WHEN the user views it
- THEN each nav item displays an icon AND a text label side by side

### Requirement: Sidebar Collapse

The Sidebar MUST support a collapsed state that shows icons only (no labels).

#### Scenario: Collapse hides labels

- GIVEN the Sidebar is in expanded state
- WHEN the user clicks the collapse toggle
- THEN all nav item labels are hidden and only icons remain visible

#### Scenario: Expand restores labels

- GIVEN the Sidebar is in collapsed state
- WHEN the user clicks the expand toggle
- THEN all nav item labels become visible again

### Requirement: Collapse State Persistence

The collapsed/expanded state MUST persist across page navigations within the session.

#### Scenario: State persists on navigation

- GIVEN the user collapses the Sidebar
- WHEN the user navigates to a different protected route
- THEN the Sidebar remains in collapsed state

#### Scenario: State does not persist across hard refresh

- GIVEN the user collapses the Sidebar
- WHEN the user performs a full page reload
- THEN the Sidebar defaults to expanded state

### Requirement: Active Route Highlighting

The Sidebar MUST visually highlight the nav item whose `href` matches the current route.

#### Scenario: Active item highlighted

- GIVEN the user is on route `/spaces`
- WHEN the Sidebar renders
- THEN the "Spaces" nav item is visually distinguished from inactive items

#### Scenario: Only one item is active

- GIVEN any protected route
- WHEN the Sidebar renders
- THEN at most one nav item carries the active highlight

### Requirement: SpaceSwitcher Section

The Sidebar MUST include a SpaceSwitcher section that displays the current space name and allows switching between the user's spaces.

#### Scenario: Current space displayed

- GIVEN a user has an active space selected
- WHEN the Sidebar renders
- THEN the current space name is visible in the SpaceSwitcher section

#### Scenario: Space switching

- GIVEN a user has multiple spaces
- WHEN the user interacts with the SpaceSwitcher
- THEN they can select a different space, updating the active space context

### Requirement: Mobile Drawer Behavior

On viewports narrower than the `lg` breakpoint the Sidebar MUST render as a drawer (hidden by default, slides in from the left with an overlay).

#### Scenario: Sidebar hidden on mobile by default

- GIVEN a viewport width below the `lg` breakpoint
- WHEN the page loads
- THEN the Sidebar is not visible and no overlay is shown

#### Scenario: Hamburger button opens drawer

- GIVEN a mobile viewport
- WHEN the user taps the hamburger/menu button
- THEN the Sidebar slides in from the left and an overlay covers the content area

### Requirement: Mobile Hamburger Button Visibility

On mobile viewports a hamburger/menu button MUST be visible to open the drawer.

#### Scenario: Hamburger visible on mobile

- GIVEN a viewport below `lg` breakpoint
- WHEN the page renders
- THEN a hamburger/menu button is visible in the UI

#### Scenario: Hamburger not visible on desktop

- GIVEN a viewport at or above `lg` breakpoint
- WHEN the page renders
- THEN the hamburger/menu button is NOT rendered or is hidden

### Requirement: Drawer Close Triggers

The mobile drawer MUST close when: the overlay is clicked, a nav item is navigated to, or the Escape key is pressed.

#### Scenario: Overlay click closes drawer

- GIVEN the mobile drawer is open
- WHEN the user clicks the overlay behind the drawer
- THEN the drawer closes and the overlay disappears

#### Scenario: Nav item navigation closes drawer

- GIVEN the mobile drawer is open
- WHEN the user taps a nav item
- THEN navigation occurs AND the drawer closes

#### Scenario: Escape key closes drawer

- GIVEN the mobile drawer is open
- WHEN the user presses the Escape key
- THEN the drawer closes

---

## CAP-3: ScreenHeader Specification

### Purpose

Per-screen horizontal header bar rendering title, optional breadcrumbs, and optional action controls.

### Requirement: ScreenHeader Title

`<ScreenHeader>` MUST accept a `title` prop (string, required) and render it using the `--font-serif` / headline token style.

#### Scenario: Title rendered with correct style

- GIVEN `<ScreenHeader title="Spaces" />`
- WHEN it renders
- THEN the text "Spaces" is visible, styled with the serif headline font token

#### Scenario: Missing title prop is a type error

- GIVEN `<ScreenHeader>` is used without the `title` prop
- WHEN TypeScript compiles
- THEN a type error is reported (required prop)

### Requirement: ScreenHeader Breadcrumbs

`<ScreenHeader>` MUST accept an optional `breadcrumbs` prop (`{ label: string; href?: string }[]`). When provided, breadcrumbs MUST be rendered as a navigable trail.

#### Scenario: Breadcrumbs rendered when provided

- GIVEN `breadcrumbs={[{ label: "Home", href: "/" }, { label: "Spaces" }]}`
- WHEN `<ScreenHeader>` renders
- THEN "Home" and "Spaces" appear as a breadcrumb trail; "Home" is a link, "Spaces" is plain text

#### Scenario: Breadcrumbs omitted when not provided

- GIVEN `<ScreenHeader title="Spaces" />` (no `breadcrumbs` prop)
- WHEN it renders
- THEN no breadcrumb trail is rendered

### Requirement: ScreenHeader Actions Slot

`<ScreenHeader>` MUST accept an optional `actions` prop (`ReactNode`). When provided, it MUST be rendered right-aligned in the header bar.

#### Scenario: Actions rendered right-aligned

- GIVEN `actions={<Button>New Space</Button>}`
- WHEN `<ScreenHeader>` renders
- THEN the button appears in the right side of the header bar

#### Scenario: No actions rendered when omitted

- GIVEN `<ScreenHeader title="Spaces" />` (no `actions` prop)
- WHEN it renders
- THEN no right-side action area is rendered

### Requirement: ScreenHeader Horizontal Bar

`<ScreenHeader>` MUST render as a horizontal bar at the top of the content area, not the full page.

#### Scenario: Header scoped to content area

- GIVEN a protected page using `<ScreenHeader>`
- WHEN the page renders inside `<AppShell>`
- THEN the header bar appears at the top of the main content area, below or alongside the Sidebar (not above it)

---

## CAP-4: Routing Fix Specification

### Purpose

Move `spaces/new` into the `(protected)` route group so the auth guard applies.

### Requirement: spaces/new Under Protected Group

The `spaces/new` route MUST reside inside `app/[lang]/(protected)/` so it participates in the authenticated layout and auth guard.

#### Scenario: Route resolves under protected group

- GIVEN a file at `app/[lang]/(protected)/spaces/new/page.tsx`
- WHEN a user navigates to `/[lang]/spaces/new`
- THEN the page renders inside `<AppShell>` with the Sidebar visible

### Requirement: Auth Guard on spaces/new

The `spaces/new` route MUST redirect unauthenticated users to the login page.

#### Scenario: Unauthenticated access redirects to login

- GIVEN a user is not authenticated
- WHEN they navigate to `/[lang]/spaces/new`
- THEN they are redirected to the login page

#### Scenario: Authenticated access renders page

- GIVEN a user is authenticated
- WHEN they navigate to `/[lang]/spaces/new`
- THEN `SpaceCreateScreen` renders inside the protected shell

---

## CAP-5: Screen Layout Updates Specification

### Purpose

Existing screens drop full-page centering and fill the shell's content area correctly.

### Requirement: SpacesListScreen Fills Content Area

`SpacesListScreen` MUST fill the available content area height provided by `<AppShell>` without overflowing or requiring its own `min-h-screen` / centering styles.

#### Scenario: SpacesListScreen renders without min-h-screen

- GIVEN `SpacesListScreen` renders inside `<AppShell>`
- WHEN inspected
- THEN it does NOT apply `min-h-screen` or full-viewport centering classes to its root element

#### Scenario: Content area height is owned by shell

- GIVEN the shell provides a scrollable content region
- WHEN `SpacesListScreen` mounts
- THEN it fills the available space without overflowing the shell boundary

### Requirement: SpaceCreateScreen Fills Content Area

`SpaceCreateScreen` MUST fill the available content area height without overflowing or using `min-h-screen` / centering styles.

#### Scenario: SpaceCreateScreen renders without min-h-screen

- GIVEN `SpaceCreateScreen` renders inside `<AppShell>`
- WHEN inspected
- THEN it does NOT apply `min-h-screen` or full-viewport centering classes to its root element

#### Scenario: SpaceCreateScreen with ScreenHeader

- GIVEN `SpaceCreateScreen` uses `<ScreenHeader title="New Space" />`
- WHEN the page renders
- THEN the header appears at the top of the content area and the form fills the remaining space below it
