# Proposal: Notifications Web Integration

## Intent

`gardenia-api` is gaining a `notifications` bounded context (see the
companion change `notifications-module` in `sisques-labs/gardenia-api`): a
tenant-scoped, per-user feed reconciled from `care-schedule` (due reminders)
and `inventory` (low-stock / expiring-soon alerts), with list, unread-count,
mark-read, and mark-all-read over GraphQL.

Web already has a reserved, non-functional slot waiting for exactly this:
`HomeTopBar` renders a plain `Bell` icon button
(`src/core/home/presentation/components/home-top-bar/home-top-bar.tsx:51-53`)
with an `aria-label` already wired to `dict.topbar.notifications` (present in
both `en.ts`/`es.ts`) and no click handler — the same "placeholder waiting
for its backend" shape that `calendar-tasks-screen` left for
`care-schedule-web` to fill.

This change adds a new `src/core/notifications/` module (GraphQL
integration, hooks, i18n) and wires that bell into a real
`NotificationBell`: unread badge, dropdown of recent notifications,
mark-read/mark-all-read, and a link to a new full `/notifications` page for
browsing history with filters.

## Scope

### In Scope

- New `src/core/notifications/` module: domain types, application ports/
  use-cases, GraphQL repository (queries + mutations), presentation hooks,
  i18n (`en`/`es` + parity test), following the `care-schedule` module as the
  structural reference (a read-heavy module with a couple of simple
  mutations, no create/update form).
- `NotificationBell` component: replaces the inert `Bell` button in
  `HomeTopBar` with a dropdown showing unread count as a badge, the most
  recent notifications (title built from `type` + `payload`, relative
  timestamp, unread indicator), per-row mark-as-read on click, a
  "mark all as read" action, and a "ver todas" link to `/notifications`.
- New protected route `app/[lang]/(protected)/notifications/page.tsx` +
  `NotificationsScreen`: full list with Unread/All tabs, paginated,
  per-row mark-as-read.
- `NotificationRow` component shared by both the dropdown and the full
  screen; builds its display text from `type` + `payload` via a small
  per-type message-building util (the API intentionally ships structured,
  untranslated `payload` — see the API design's payload rationale — so text
  generation is a web concern, done here through the existing i18n
  dictionary, not hardcoded).
- Unread count polling (`refetchInterval`) so the badge updates without a
  page reload — there is no real-time channel (WebSocket/SSE) yet on either
  side, and the API itself is a polling reconciliation job in v1, so a
  modest client poll interval is consistent with the whole feature's
  freshness budget, not a mismatch.

### Out of Scope

- Making the bell appear on every screen (currently only `HomeTopBar` has
  one; other screens use bare `ScreenHeader` with no notifications slot).
  Filling every screen's header is a natural follow-up once product wants
  persistent access outside Home, not required to ship this integration.
- Any change to `gardenia-api` — this change consumes the
  `notifications-module` GraphQL API as-is. If that change's shape hasn't
  landed yet, this change blocks on it (see Dependencies).
- Toast/desktop push notifications, sound, or browser Notification API
  integration.
- User-configurable preferences (mute a type, change windows) — matches the
  API's v1 scope, which has no such settings to surface.
- Real-time delivery (WebSocket/SSE) — polling only, matching the API's
  in-app-only, non-push v1.

## Capabilities

### New Capabilities

- `notifications-web`: `src/core/notifications/` module + `NotificationBell`
  + `/notifications` screen — list, unread badge, mark-read, mark-all-read.

### Modified Capabilities

- `home-dashboard`: `HomeTopBar`'s placeholder bell button becomes the real
  `NotificationBell`.

## Approach

- **Module boundary matches `care-schedule` exactly**: `src/core/notifications/`
  owns its GraphQL repository, use-cases, and hooks; `home` and any future
  consumer only ever imports `NotificationBell` (a presentation component),
  never reaches into `notifications`' application/infrastructure layers
  directly — same rule the AGENTS.md cross-layer rules already state.
- **Filters via the typed Criteria pattern**, mirroring `care-schedule`'s
  `CareScheduleQueryableField` + `toApiFilters()` confinement (ADR-003 in
  that change): a `NotificationQueryableField` enum (`type`, `status`) and
  filter-building logic live solely inside
  `NotificationGqlRepository.findByCriteria()`; every other layer only knows
  the ergonomic `NotificationFilters` shape (camelCase).
- **No create/update flow** — this module is read + two simple mutations
  (`markRead`, `markAllRead`), so there is no `use-notification-form` hook,
  no Zod schema, no modal. Structurally closer to `care-log`'s read
  integration than to `harvests`' full CRUD.
- **Display text built client-side from `type` + `payload`**, not sent
  pre-rendered by the API. A `buildNotificationMessage(notification, dict)`
  util in `presentation/utils/` switches on `type` and interpolates fields
  out of `payload` (e.g. `payload.plantName`, `payload.activityType` for
  `CARE_SCHEDULE_DUE`; `payload.itemName`, `payload.quantity`,
  `payload.unit` for `INVENTORY_LOW_STOCK`). New types added later need a
  new `case` here and new i18n keys — no API-side change.

## Affected Areas

| Area | Impact | Description |
|------|--------|--------------|
| `src/core/notifications/` | New | Full module (domain/application/infrastructure/presentation) |
| `src/core/home/presentation/components/home-top-bar/home-top-bar.tsx` | Modified | Bell button → `NotificationBell` |
| `app/[lang]/(protected)/notifications/` | New | `page.tsx` + skeleton |
| `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` | Unmodified | Deliberately not adding a nav entry — the bell is the entry point, consistent with keeping this list to primary garden domains (see Design) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `notifications-module` (API) ships with a different field/enum shape than assumed here | Med | This change is written against that change's `design.md` contracts; if the API shape changes before this lands, only the GraphQL repository + response types need updating, not the use-cases/hooks/components (hexagonal boundary absorbs the change) |
| Polling the unread-count query too aggressively adds load | Low | Default interval kept conservative (60s); easy to tune without touching component code (single constant) |
| `payload` shape drifts silently (API adds/renames a field the web reads) | Low | `buildNotificationMessage` reads `payload` defensively (optional chaining, fallback generic text) rather than assuming presence; a mismatch degrades to a generic message, not a crash |

## Dependencies

- **Blocks on `sisques-labs/gardenia-api`'s `notifications-module` change**
  being implemented and deployed (or at minimum, its GraphQL schema —
  `notificationsFindByCriteria`, `notificationsUnreadCount`,
  `notificationMarkRead`, `notificationsMarkAllRead` — being available in the
  environment this is developed/tested against).
- Reuses `Filter<TField>`/`FilterOperator` (`shared/domain/`), `apolloClient`,
  TanStack Query conventions, `ScreenHeader`, shadcn `DropdownMenu`/`Badge`.

## Success Criteria

- [ ] `HomeTopBar`'s bell shows an unread-count badge that updates within
      one polling interval of a new notification appearing server-side.
- [ ] Clicking the bell opens a dropdown of recent notifications with
      human-readable text per type; clicking a row marks it read and
      updates the badge.
- [ ] "Marcar todas como leídas" clears the badge and the dropdown's unread
      indicators without a full page reload.
- [ ] `/notifications` lists the user's own notifications only, with
      working Unread/All tabs and pagination.
- [ ] `pnpm test`, `pnpm lint`, `pnpm tsc --noEmit` green; `notifications`
      module has an `i18n-parity.test.ts` passing for `en`/`es`.
