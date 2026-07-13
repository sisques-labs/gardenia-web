# notifications-web Specification

## Purpose

Consume `gardenia-api`'s `notifications` GraphQL API: a per-user, unread-badge
notification feed accessible via a bell dropdown and a full `/notifications`
screen, with mark-read / mark-all-read.

## Requirements

### Requirement: Notification Module Boundary

The system MUST implement `src/core/notifications/` following the
DDD+Hexagonal layering already used by every other module: `domain` MUST NOT
import from `application`/`infrastructure`/`presentation`; `application` MUST
NOT import framework code (React, Apollo, Zustand) and MUST depend only on
`INotificationRepository`; `infrastructure` MUST be the only layer importing
`apolloClient`. No other module (`home` or otherwise) MUST import
`notifications`' `application` or `infrastructure` layers directly — only its
`presentation` components (`NotificationBell`, screens).

#### Scenario: Application layer has no framework imports

- GIVEN the source files under `src/core/notifications/application/`
- WHEN scanned for imports
- THEN none import from `react`, `@apollo/client`, `zustand`, or any Zustand store

#### Scenario: Consumers only import presentation components

- GIVEN `src/core/home/presentation/components/home-top-bar/home-top-bar.tsx`
- WHEN its imports are inspected
- THEN it imports only `NotificationBell` from `@/core/notifications/presentation/components/notification-bell/notification-bell`, nothing from `notifications`' application or infrastructure layers

---

### Requirement: NotificationFindByCriteria Filters

`useNotifications(filters?: NotificationFilters)` MUST accept optional
`status` (`'UNREAD' | 'READ'`) and `type` filters and translate them, inside
`NotificationGqlRepository` only, to `Filter<NotificationQueryableField>[]`
using `FilterOperator.EQUALS`. No other layer MUST construct `Filter`
objects directly.

#### Scenario: Filtering by status

- GIVEN `useNotifications({ status: 'UNREAD' })` is called
- WHEN the underlying GraphQL query executes
- THEN it includes a filter `{ field: 'status', operator: 'EQUALS', value: 'UNREAD' }`

#### Scenario: No filters requests everything visible to the user

- GIVEN `useNotifications()` is called with no arguments
- WHEN the underlying GraphQL query executes
- THEN no `filters` are sent (the API already scopes results to the authenticated user and active space)

---

### Requirement: Real-Time Delivery via SSE

`NotificationsProvider` MUST open a single connection to `GET
/notifications/stream` (via `connectNotificationsStream`, using
`@microsoft/fetch-event-source` so the `Authorization` Bearer header and
`X-Space-ID` can be set — native `EventSource` cannot) for the lifetime of
an authenticated session with an active space, and MUST NOT open more than
one such connection at a time regardless of how many
`NotificationBell`/`NotificationsScreen` instances are mounted. On receiving
a `notification-created`, `notification-read`, or `notification-resolved`
event, it MUST invalidate both the `['notifications', spaceId]` and
`['notifications-unread-count', spaceId]` TanStack Query caches so the bell
badge and any visible list reflect the change without a page reload. It
MUST NOT open a connection when there is no active space, and MUST close the
current connection and open a new one when the active space changes.

#### Scenario: Badge updates in real time on a new notification

- GIVEN `NotificationsProvider` is connected
- WHEN a `notification-created` event arrives on the stream
- THEN `NotificationBell`'s badge reflects the new unread count without any user action or page reload

#### Scenario: A single connection is shared across components

- GIVEN both `NotificationBell` (in `HomeTopBar`) and `NotificationsScreen` (on `/notifications`) are mounted simultaneously
- WHEN the app is inspected for open SSE connections
- THEN there is exactly one, owned by `NotificationsProvider`

#### Scenario: No connection without an active space

- GIVEN no space is currently active
- WHEN `NotificationsProvider` renders
- THEN no SSE connection is opened

#### Scenario: Reconnects on space switch

- GIVEN `NotificationsProvider` is connected for space S1
- WHEN the active space changes to S2
- THEN the S1 connection is aborted and a new connection is opened scoped to S2

---

### Requirement: Fallback Polling

Independently of the SSE connection's state, `useNotificationsUnreadCount()`
MUST also poll `notificationsUnreadCount` on a coarse fixed interval
(`refetchInterval`, default 5 minutes) as a safety net against a silently
stalled SSE connection (proxy buffering, a resumed-from-sleep dead socket).
This polling MUST be disabled (`enabled: false`) when there is no active
space, matching every other space-scoped query in this codebase.

#### Scenario: Fallback catches a stalled SSE connection

- GIVEN the SSE connection has silently stopped delivering events (e.g. its underlying socket died without the client noticing)
- WHEN the fallback poll interval elapses
- THEN the unread count is refreshed via the ordinary GraphQL query, independent of SSE

#### Scenario: No polling without an active space

- GIVEN no space is currently active
- WHEN `useNotificationsUnreadCount` is used
- THEN no query is executed

---

### Requirement: Mark Read / Mark All Read

Clicking a `NotificationRow` MUST call `markRead` for that notification's id
and, on success, invalidate both the notifications list query and the
unread-count query for the active space. A "mark all as read" action MUST
call `markAllRead` with the same invalidation behavior. Both MUST be scoped
implicitly to the authenticated user by the API — the client sends no
`userId`.

#### Scenario: Marking a single notification read updates both list and badge

- GIVEN an unread notification is visible in the dropdown
- WHEN the user clicks it
- THEN `markRead` is called with its id, and after success both `['notifications', spaceId]` and `['notifications-unread-count', spaceId]` are invalidated

#### Scenario: Mark all as read clears the badge

- GIVEN the user has 3 unread notifications
- WHEN the user clicks "marcar todas como leídas"
- THEN `markAllRead` is called and, after success, the badge shows 0

---

### Requirement: Notification Message Building

`buildNotificationMessage(notification, dict)` MUST produce human-readable
text for each of the three v1 `type` values (`CARE_SCHEDULE_DUE`,
`INVENTORY_LOW_STOCK`, `INVENTORY_EXPIRING_SOON`) by reading fields out of
`payload`, and MUST fall back to a generic, type-derived message (never
throw or render blank) when an expected `payload` field is missing.

#### Scenario: CARE_SCHEDULE_DUE message

- GIVEN a notification with `type: 'CARE_SCHEDULE_DUE'` and `payload: { plantName: 'Tomatera', activityType: 'WATERING' }`
- WHEN `buildNotificationMessage` is called
- THEN the returned text references both the plant name and the activity

#### Scenario: Missing payload field falls back gracefully

- GIVEN a notification with `type: 'INVENTORY_LOW_STOCK'` and a `payload` missing `itemName`
- WHEN `buildNotificationMessage` is called
- THEN a generic, non-empty fallback message is returned instead of throwing

---

### Requirement: Notifications Screen

`app/[lang]/(protected)/notifications/page.tsx` MUST render
`NotificationsScreen` with Unread/All tabs, each backed by
`useNotifications({ status: 'UNREAD' })` / `useNotifications()`
respectively, paginated, each row supporting mark-as-read. The route MUST be
unreachable by unauthenticated users (protected group).

#### Scenario: Switching tabs changes the filter

- GIVEN the Unread tab is active
- WHEN the user switches to the All tab
- THEN the list re-fetches without a `status` filter and may include read notifications

#### Scenario: Unauthenticated access redirected

- GIVEN the user is NOT authenticated
- WHEN the browser navigates to `/${locale}/notifications`
- THEN the middleware redirects away from the protected route
