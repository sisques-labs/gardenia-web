# home-dashboard Specification — Delta: Functional Notification Bell

> Delta applied on top of `openspec/changes/dashboard-home/specs/home-dashboard/spec.md`
> (the current merged spec for `home-dashboard`). Replaces the non-functional
> bell placeholder in `HomeTopBar` with the real `NotificationBell`.

---

## MODIFIED Requirements

### Requirement: HomeTopBar

The system MUST render a `HomeTopBar` component containing: a greeting
derived from the authenticated user's email prefix and the active space name
(sourced from `useAuthStore` and `useSpacesStore`), a search input (display
only, non-functional), a **functional notification bell** (`NotificationBell`
from `@/core/notifications/presentation/components/notification-bell/notification-bell`,
showing a badge with the unread count — kept live via `NotificationsProvider`'s
SSE connection, not a fixed poll — and opening a dropdown of recent
notifications on click), and a "Nueva entrada" CTA (non-functional). The
search input and CTA remain display-only; only the bell becomes functional
in this change.

#### Scenario: Top bar shows greeting with real user data

- GIVEN a user with email `"ana@example.com"` and active space `"Mi Huerto"`
- WHEN `HomeTopBar` renders
- THEN the greeting text is visible and contains `"ana"` (email prefix) and/or `"Mi Huerto"` (space name)

#### Scenario: Search input is visible but non-functional

- GIVEN `HomeTopBar` is rendered
- WHEN the user types in the search input
- THEN no search action, navigation, or state change occurs

#### Scenario: Bell icon shows unread count and opens the notification dropdown

- GIVEN `HomeTopBar` is rendered and the user has 2 unread notifications
- WHEN the top bar renders
- THEN the bell shows a badge with `2`
- WHEN the user clicks the bell
- THEN a dropdown opens listing recent notifications

#### Scenario: CTA is visible but non-functional

- GIVEN `HomeTopBar` is rendered
- WHEN the user clicks the "Nueva entrada" CTA
- THEN it still opens the existing create-menu dropdown (unchanged by this delta) and does not touch notifications state
