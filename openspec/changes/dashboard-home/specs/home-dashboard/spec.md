# home-dashboard Specification

## Purpose

Full-screen structural home dashboard for authenticated users. Renders a top bar with real user context and five placeholder sections under individual Suspense boundaries. No domain data is loaded yet — all sections communicate "En desarrollo" to the user.

## Requirements

### Requirement: Home Route

The system MUST expose a protected route at `app/[lang]/(protected)/home/page.tsx` as an async Server Component. It MUST resolve the current locale and pass the `home` dictionary slice to `HomeScreen`. The route MUST be unreachable by unauthenticated users (protected group middleware applies).

#### Scenario: Authenticated user visits home route

- GIVEN the user is authenticated
- WHEN the browser navigates to `/${locale}/home`
- THEN `HomeScreen` is rendered with the correct locale and dictionary

#### Scenario: Unauthenticated user visits home route

- GIVEN the user is NOT authenticated
- WHEN the browser navigates to `/${locale}/home`
- THEN the middleware redirects the request away from the protected route (no home screen rendered)

---

### Requirement: HomeTopBar

The system MUST render a `HomeTopBar` component containing: a greeting derived from the authenticated user's email prefix and the active space name (sourced from `useAuthStore` and `useSpacesStore`), a search input (display only, non-functional), a bell icon (non-functional), and a "Nueva entrada" CTA (non-functional). None of the non-functional elements MUST trigger navigation or state changes.

#### Scenario: Top bar shows greeting with real user data

- GIVEN a user with email `"ana@example.com"` and active space `"Mi Huerto"`
- WHEN `HomeTopBar` renders
- THEN the greeting text is visible and contains `"ana"` (email prefix) and/or `"Mi Huerto"` (space name)

#### Scenario: Search input is visible but non-functional

- GIVEN `HomeTopBar` is rendered
- WHEN the user types in the search input
- THEN no search action, navigation, or state change occurs

#### Scenario: Bell icon and CTA are visible but non-functional

- GIVEN `HomeTopBar` is rendered
- WHEN the user clicks the bell icon or the "Nueva entrada" CTA
- THEN no navigation or state change occurs

---

### Requirement: Five Suspense-Wrapped Sections

The system MUST render exactly five sections inside `HomeScreen`, each wrapped in a `<Suspense>` boundary with a per-section skeleton component as the fallback. The five sections MUST be: `TodayTasksSection`, `GrowingNowSection`, `MiniMapSection`, `HarvestPaceSection`, and `JournalSection`. Each section MUST render visible text `"En desarrollo"` in the DOM.

#### Scenario: Each section renders its placeholder text

- GIVEN `HomeScreen` is mounted
- WHEN the component renders
- THEN the text `"En desarrollo"` is visible in the DOM for each of the five sections

#### Scenario: Per-section skeleton is used as Suspense fallback

- GIVEN any of the five sections is suspended
- WHEN the Suspense boundary activates
- THEN the section's own skeleton component (`{Section}Skeleton`) is rendered as fallback, mimicking the section's shape with `animate-pulse` shimmer blocks

---

### Requirement: Home i18n

The system MUST provide `en.ts` and `es.ts` dictionary files for the `home` context, registered in `get-dictionary.ts` under the `home` key. Every key present in `en.ts` MUST also be present in `es.ts` (parity). The `HomeDict` type MUST be exported from `en.ts`.

#### Scenario: i18n parity test passes

- GIVEN `src/core/home/presentation/i18n/en.ts` and `es.ts` exist
- WHEN the parity test runs
- THEN no missing or extra keys are reported between the two locales

#### Scenario: get-dictionary exposes home slice

- GIVEN `getDictionary(locale)` is called
- WHEN the result is accessed
- THEN `result.home` is a non-empty object matching `HomeDict`

---

### Requirement: Home Nav Item

The system MUST add a `Home` entry to the sidebar navigation items so users can navigate to `/${locale}/home` from within the protected shell.

#### Scenario: Home appears in sidebar

- GIVEN the authenticated user is inside the protected shell
- WHEN the sidebar nav renders
- THEN a "Home" (or equivalent translated label) nav item is visible and its href resolves to `/${locale}/home`
