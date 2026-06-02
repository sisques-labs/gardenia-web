# Proposal: Sidebar + Screen Header Shell

## Intent

Authenticated screens have no persistent navigation shell. Each screen centers its own content with `min-h-screen`, so there is no way to move between areas or anchor a consistent screen title/actions. We need a persistent `Sidebar` (rendered once) plus a per-screen `ScreenHeader` (title, breadcrumbs, actions) to give the protected app a coherent navigation frame.

## Scope

### In Scope
- `AppShell` shell (sidebar + main content area) wired into `app/[lang]/(protected)/layout.tsx`.
- `Sidebar` nav component (persistent across protected routes).
- `ScreenHeader` component used per-page (title + optional breadcrumbs + actions slot).
- Fix routing bug: move `app/[lang]/spaces/new/page.tsx` into the `(protected)` group.
- Update existing protected screens (`SpacesListScreen`, `SpaceCreateScreen`) to drop `min-h-screen`/full-page centering and adopt `ScreenHeader`.

### Out of Scope
- Sidebar collapse/expand and mobile drawer behavior (deferred — see Open Questions).
- Space switcher inside the sidebar.
- Fixing the pre-existing double-provider wrap in `[lang]/layout.tsx`.
- Auth screens (login/register) — no shell.

## Capabilities

### New Capabilities
- `app-shell`: persistent navigation shell (sidebar + content area) for authenticated routes.
- `screen-header`: per-screen header contract (title, breadcrumbs, actions).

### Modified Capabilities
None — no existing specs in `openspec/specs/`.

## Approach

Approach C (Hybrid). `(protected)/layout.tsx` renders `<AppShell>` so the sidebar mounts once and persists across navigation (App Router layout semantics). `ScreenHeader` stays a standalone shared component each page composes itself — avoids prop-drilling a monolithic template and keeps per-page flexibility for title/breadcrumbs/actions. Components live under `src/shared/presentation/components/{app-shell,sidebar,screen-header}/`. Sidebar surface uses design tokens (`--paper`, `--rule`, `--ink`, `--forest`) and `.paper-grain` texture; `.dashed-rule` for dividers.

### Component API sketch
- `ScreenHeader`: `{ title: string; breadcrumbs?: { label: string; href?: string }[]; actions?: ReactNode }`.
- `Sidebar`: nav items `{ label: string; href: string; icon?: ReactNode }[]` (static config initially).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/[lang]/(protected)/layout.tsx` | Modified | Wrap children in `AppShell` |
| `src/shared/presentation/components/app-shell/` | New | Shell layout |
| `src/shared/presentation/components/sidebar/` | New | Nav sidebar |
| `src/shared/presentation/components/screen-header/` | New | Per-screen header |
| `app/[lang]/spaces/new/page.tsx` | Moved | Into `(protected)` group |
| `SpacesListScreen`, `SpaceCreateScreen` | Modified | Drop `min-h-screen`, add `ScreenHeader` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Moving `spaces/new` breaks links/imports | Med | Grep references, keep route path identical (only group changes) |
| Screen-height/layout regressions after removing `min-h-screen` | Med | Shell owns `h-full`/`flex-1`; verify each screen visually |
| Existing screen tests break on markup change | Med | Update tests under strict TDD before/with edits (Vitest) |

## Rollback Plan

Revert the `(protected)/layout.tsx` change to render children directly, delete the three new component dirs, and move `spaces/new` back. Screens revert to `min-h-screen` via git revert of the feature commits.

## Dependencies

- Design tokens and utility classes already present in `src/design-system/`.

## Success Criteria

- [ ] Sidebar renders once and persists across protected route navigation.
- [ ] Each protected screen shows a `ScreenHeader` with its title.
- [ ] `spaces/new` lives inside `(protected)` and is auth-guarded.
- [ ] No protected screen uses `min-h-screen` centering; content fills the shell.
- [ ] Vitest suite passes (updated screen tests included).
