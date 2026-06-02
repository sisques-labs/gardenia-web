# Spec: dashboard-home

## Capabilities

| Capability | Type | Spec file |
|------------|------|-----------|
| `home-dashboard` | New | `specs/home-dashboard/spec.md` |
| `auth` (post-login redirect) | Delta | `specs/auth/spec.md` |

## Summary

This change introduces two deliverables:

1. **home-dashboard** — a new protected route and `HomeScreen` with `HomeTopBar` (real auth/spaces data) and five `<Suspense>`-wrapped sections each showing "En desarrollo". Includes i18n (`en`/`es`) and a sidebar nav item.

2. **auth delta** — `LoginScreen` gains a `locale` prop; its fallback redirect changes from `/` to `/${locale}/home`. Middleware authenticated-user redirect changes from `/${locale}` to `/${locale}/home`. Login test updated to cover the new target.

## Requirements Coverage

| ID | Domain | Name | Type |
|----|--------|------|------|
| REQ-HD-01 | home-dashboard | Home Route | Added |
| REQ-HD-02 | home-dashboard | HomeTopBar | Added |
| REQ-HD-03 | home-dashboard | Five Suspense-Wrapped Sections | Added |
| REQ-HD-04 | home-dashboard | Home i18n | Added |
| REQ-HD-05 | home-dashboard | Home Nav Item | Added |
| REQ-AU-01 | auth | Post-Login Redirect to Home | Added |

## Scenarios Coverage

| ID | Requirement | Name |
|----|-------------|------|
| SCN-HD-01 | REQ-HD-01 | Authenticated user visits home route |
| SCN-HD-02 | REQ-HD-01 | Unauthenticated user visits home route |
| SCN-HD-03 | REQ-HD-02 | Top bar shows greeting with real user data |
| SCN-HD-04 | REQ-HD-02 | Search input is visible but non-functional |
| SCN-HD-05 | REQ-HD-02 | Bell icon and CTA are visible but non-functional |
| SCN-HD-06 | REQ-HD-03 | Each section renders its placeholder text |
| SCN-HD-07 | REQ-HD-03 | InProgressPlaceholder is used as Suspense fallback |
| SCN-HD-08 | REQ-HD-04 | i18n parity test passes |
| SCN-HD-09 | REQ-HD-04 | get-dictionary exposes home slice |
| SCN-HD-10 | REQ-HD-05 | Home appears in sidebar |
| SCN-AU-01 | REQ-AU-01 | Successful login redirects to home |
| SCN-AU-02 | REQ-AU-01 | Login screen fallback redirect uses locale |
| SCN-AU-03 | REQ-AU-01 | Middleware redirects authenticated user away from auth routes |
| SCN-AU-04 | REQ-AU-01 | Login page threads locale into LoginScreen |
| SCN-AU-05 | REQ-AU-01 | Login screen test covers new redirect target |

## Out of Scope

- Real data for any of the five sections
- Sparkline / chart library
- SVG garden map content
- `AppShell` / `Sidebar` structural changes
- `displayName` on `AccountUser`
