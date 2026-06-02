# Design: Dashboard Home Screen + Post-Login Redirect

## Technical Approach

A new `home` presentation context (`src/core/home/presentation/`) mirroring the existing `spaces` layering. The `home/page.tsx` async Server Component resolves `locale` + `dict` (exact `spaces/page.tsx` pattern) and renders `HomeScreen` (Client Component). `HomeScreen` composes a separate `HomeTopBar` (reads `useAuthStore`/`useSpacesStore`) plus a Tailwind 2-column grid of five section components, each independently wrapped in `<Suspense>` with its own skeleton fallback component. Each skeleton mimics the shape of its section using pulse/shimmer CSS. The redirect fix threads `locale` into `LoginScreen` and updates two redirect targets. No new dependencies; sections render "En desarrollo" content while skeletons handle the loading state.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|----------|--------|----------|-----------|
| Suspense fallback | Per-section skeleton component | Shared `InProgressPlaceholder` | Each section has a distinct shape; per-section skeletons give accurate loading preview and are self-contained |
| Skeleton location | Co-located: `components/{section}/{section}.skeleton.tsx` | Shared skeleton folder | Skeletons are tightly coupled to their section's layout — co-location reduces drift |
| TopBar location | Separate `components/home-top-bar/` | Inline in `HomeScreen` | Single-responsibility; only piece touching stores, isolates its own test |
| Grid implementation | Tailwind classes (`grid grid-cols-[1.3fr_1fr]`) | Inline CSS styles from dashboard.jsx | Consistent with codebase Tailwind usage; design.jsx is a non-authoritative mock |
| Suspense boundary | Per-section (5 boundaries) | One wrapping the grid | Per-spec; future sections stream independently without blocking siblings |
| Greeting source | `currentUser.email` split at `@`, fallback `currentSpace().name` | New `displayName` on `AccountUser` | `AccountUser` only has `{id,email}`; no domain change needed |

## Data Flow

```
home/page.tsx (Server)              middleware.ts / login.screen.tsx
  resolve locale + dict               redirect -> /${locale}/home
        │ dict.home, lang
        ▼
  HomeScreen (Client)
        │ dict.home          ┌──── useAuthStore  (currentUser.email)
        ├──────────────────► HomeTopBar
        │                     └──── useSpacesStore (currentSpace().name)
        │ dict.home.<section>
        ▼
  5x <Suspense fallback={<{Section}Skeleton />}>
        └─► Section (dict prop) -> .card wrapper -> "En desarrollo" content
```

Dict flows top-down by prop only. Auth/spaces data is read solely inside `HomeTopBar` via store hooks — no prop drilling of user/space.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/[lang]/(protected)/home/page.tsx` | Create | Async SC: resolve locale+dict, render `<HomeScreen dict={dict.home} lang={locale} />` |
| `src/core/home/presentation/screens/home/home.screen.tsx` | Create | Client; flex column = `HomeTopBar` + scrollable Tailwind 2-col grid of 5 Suspense sections |
| `src/core/home/presentation/screens/home/home.screen.test.tsx` | Create | Strict-TDD: renders topbar greeting + 5 placeholders |
| `src/core/home/presentation/components/home-top-bar/home-top-bar.tsx` | Create | Greeting (email prefix / space name), search, bell, "Nueva entrada" CTA |
| `src/core/home/presentation/components/today-tasks-section/today-tasks-section.tsx` | Create | Section component; `.card` wrapper, "En desarrollo" content |
| `src/core/home/presentation/components/today-tasks-section/today-tasks-section.skeleton.tsx` | Create | Skeleton: title shimmer + 4 task-row shimmers |
| `src/core/home/presentation/components/growing-now-section/growing-now-section.tsx` | Create | Section component; `.card` wrapper, "En desarrollo" content |
| `src/core/home/presentation/components/growing-now-section/growing-now-section.skeleton.tsx` | Create | Skeleton: title shimmer + 3×2 card grid shimmers |
| `src/core/home/presentation/components/mini-map-section/mini-map-section.tsx` | Create | Section component; `.card` wrapper, "En desarrollo" content |
| `src/core/home/presentation/components/mini-map-section/mini-map-section.skeleton.tsx` | Create | Skeleton: title shimmer + rectangular map area shimmer |
| `src/core/home/presentation/components/harvest-pace-section/harvest-pace-section.tsx` | Create | Section component; `.card` wrapper, "En desarrollo" content |
| `src/core/home/presentation/components/harvest-pace-section/harvest-pace-section.skeleton.tsx` | Create | Skeleton: title shimmer + 5 sparkline-row shimmers |
| `src/core/home/presentation/components/journal-section/journal-section.tsx` | Create | Section component; `.card` wrapper, "En desarrollo" content |
| `src/core/home/presentation/components/journal-section/journal-section.skeleton.tsx` | Create | Skeleton: title shimmer + 3 entry shimmers |
| `src/core/home/presentation/i18n/en.ts`, `es.ts` | Create | `as const` `HomeDict` (greeting, topbar, 5 section titles, `inProgress`) |
| `src/core/home/presentation/i18n/i18n-parity.test.ts` | Create | en/es key parity |
| `src/shared/presentation/i18n/get-dictionary.ts` | Modify | Import home dicts; add `home` to `AppDict` + both locale maps |
| `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` | Modify | Prepend `{ label:'Home', href:'/[lang]/home', icon: IconHome }` (lucide `Home`) |
| `src/core/auth/presentation/screens/login/login.screen.tsx` | Modify | Add `locale: string` prop; `router.replace(searchParams.get('returnUrl') ?? \`/${locale}/home\`)` |
| `app/[lang]/(auth)/login/page.tsx` | Modify | Pass `locale={locale}` to `LoginScreen` |
| `middleware.ts` | Modify | Authenticated public redirect target `/${locale}` -> `/${locale}/home` (line 38) |

## Interfaces / Contracts

```ts
// home/presentation/i18n/en.ts
const en = {
  topbar: { search: '...', newEntry: '...' },
  greeting: '...',                 // template uses email prefix / space name
  sections: { todayTasks, growingNow, miniMap, harvestPace, journal },
  inProgress: 'En desarrollo',
} as const;
export type HomeDict = typeof en;

// get-dictionary.ts
export type AppDict = { auth: ...; spaces: ...; home: WidenStringLiterals<HomeDict> };

// home.screen.tsx
type Props = { dict: AppDict['home']; lang: string };
// per-section skeleton (example: today-tasks-section.skeleton.tsx)
// No props — shape is hardcoded to match the section layout
export function TodayTasksSkeleton() { /* pulse shimmer blocks */ }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `home.screen.test.tsx`: topbar greeting renders; 5 sections each show `inProgress` placeholder | Vitest + RTL, mock `useAuthStore`/`useSpacesStore` |
| Unit | i18n parity en/es | `i18n-parity.test.ts` key-set equality (mirrors spaces) |
| Unit | `LoginScreen` redirect -> `/${locale}/home` when no `returnUrl` | Mock `useRouter`/`useSearchParams`, assert `replace` |
| Manual | Login lands on `/home`; nav item routes; authed user at `/${locale}` -> `/home` | Browser smoke |

Strict TDD: write each failing test before the component (`home.screen.test.tsx`, i18n parity, login redirect assertion) first.

## Migration / Rollout

No migration required. Entirely additive except 3 small line edits (login screen, login page, middleware). Rollback = revert branch.

## Open Questions

- [ ] None blocking. `IconHome` = lucide-react `Home` (aliased). Greeting copy: email prefix primary, current space name fallback.
