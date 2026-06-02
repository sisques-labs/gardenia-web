# Proposal: Dashboard Home Screen + Post-Login Redirect

## Intent

There is no home screen, and post-login redirect dead-ends. `LoginScreen` falls back to `/`, and middleware redirects authenticated users to `/${locale}` — both resolve to the Next.js boilerplate (`app/page.tsx`), not the protected area. Users who log in have nowhere to land. This change creates the home dashboard and fixes the redirect so authenticated users reach a real screen.

## Scope

### In Scope
- New route `app/[lang]/(protected)/home/page.tsx` (async Server Component).
- `HomeScreen` Client Component with 5 sections, each wrapped in `<Suspense>` showing an "En desarrollo" placeholder.
- `HomeTopBar` with greeting (real data from `useAuthStore` + `useSpacesStore`), search input, bell, "Nueva entrada" CTA.
- Section skeletons: `TodayTasksSection`, `GrowingNowSection`, `MiniMapSection`, `HarvestPaceSection`, `JournalSection`.
- i18n for `home` context (`en.ts`, `es.ts`, parity test); register `home` in `get-dictionary.ts`.
- Add `Home` nav item to sidebar.
- Fix post-login redirect: `LoginScreen` fallback → `/${locale}/home`; middleware authenticated redirect → `/${locale}/home`. Thread `locale` prop into `LoginScreen`.
- Strict TDD: `home.screen.test.tsx`.

### Out of Scope
- Real data for the 5 sections (no tasks/plants/garden/harvest/journal domain contexts or backend endpoints yet).
- Sparkline / chart library — Harvest Pace stays placeholder; no new dependency.
- SVG garden map content — placeholder only.
- Changes to `AppShell` / `Sidebar` internals (already complete).
- A `displayName` on `AccountUser` — greeting uses email prefix or current space name.

## Capabilities

### New Capabilities
- `home-dashboard`: protected home screen with top bar (real greeting) and five placeholder sections under Suspense boundaries.

### Modified Capabilities
- `auth`: post-login redirect target changes from `/` to `/${locale}/home` (behavior change in `LoginScreen` + middleware).

## Approach

Exploration Approach 1 + greeting enhancement. Build the structural dashboard: route + `HomeScreen` rendering `HomeTopBar` plus five `<Suspense>`-wrapped sections, each falling back to a shared placeholder ("En desarrollo"). Only `HomeTopBar` consumes real data (auth + spaces stores) — a free win with zero new infra. Follow the existing i18n pattern (typed `as const` dicts merged in `get-dictionary.ts`, plus parity test). Fix the redirect at both touch points and thread `locale` from `login/page.tsx` into `LoginScreen`. Each future section becomes its own change once endpoints exist.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/[lang]/(protected)/home/page.tsx` | New | Home route, async SC resolving locale + dict |
| `src/core/home/presentation/screens/home/home.screen.tsx` | New | Main dashboard Client Component |
| `src/core/home/presentation/screens/home/home.screen.test.tsx` | New | Strict-TDD test |
| `src/core/home/presentation/components/` | New | Top bar + 5 section components + placeholder |
| `src/core/home/presentation/i18n/{en,es}.ts` + `i18n-parity.test.ts` | New | Home dictionary + parity test |
| `src/shared/presentation/i18n/get-dictionary.ts` | Modified | Register `home` in `AppDict` |
| `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` | Modified | Add Home nav item |
| `src/core/auth/presentation/screens/login/login.screen.tsx` | Modified | Redirect fallback `/${locale}/home`; accept `locale` prop |
| `app/[lang]/(auth)/login/page.tsx` | Modified | Pass `locale` to `LoginScreen` |
| `middleware.ts` | Modified | Authenticated redirect target → `/${locale}/home` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `LoginScreen` lacks `locale` prop — signature + test change | Med | Add optional-then-required prop; update login test in same change |
| `AccountUser` has no `displayName` | High | Use email prefix or current space name for greeting |
| Authenticated user at `/${locale}` still hits boilerplate | Med | Redirect now targets `/home`; covered by this change |
| Harvest Pace expectation of charts | Low | Explicitly deferred; placeholder communicates "En desarrollo" |

## Rollback Plan

Revert the feature branch. Removing `src/core/home/`, the `home` route, and the i18n/nav additions is additive and safe. The redirect/middleware/login edits are 3 small line changes — revert restores prior `/` fallback behavior with no data migration.

## Dependencies

- None. No new npm packages; reuses existing design-system CSS, shadcn primitives, and auth/spaces stores.

## Success Criteria

- [ ] Successful login lands the user at `/${locale}/home` (not boilerplate).
- [ ] `/${locale}/home` renders top bar with real greeting + 5 Suspense sections showing "En desarrollo".
- [ ] Home nav item appears in sidebar and routes to home.
- [ ] `home` i18n parity test passes (en/es key parity).
- [ ] `home.screen.test.tsx` passes (strict TDD).
