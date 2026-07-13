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

This change adds a new `src/core/notifications/` module (GraphQL for
list/mark-read/mark-all-read, plus a **Server-Sent Events client** for
real-time delivery — the companion API change now ships `GET
/notifications/stream` in v1, not as a later phase) and wires that bell into
a real `NotificationBell`: live-updating unread badge, dropdown of recent
notifications, mark-read/mark-all-read, and a link to a new full
`/notifications` page for browsing history with filters.

## Scope

### In Scope

- New `src/core/notifications/` module: domain types, application ports/
  use-cases, GraphQL repository (queries + mutations), an **SSE
  infrastructure client**, presentation hooks and a provider, i18n
  (`en`/`es` + parity test). Structurally closer to `care-schedule` (a
  read-heavy module with simple mutations, no create/update form) plus one
  thing no existing module has: a persistent streaming connection.
- **`NotificationsProvider`** (mounted once, in `Providers`): opens a single
  shared SSE connection to `GET /api/notifications/stream` for the lifetime
  of an authenticated session, using `@microsoft/fetch-event-source` (new
  dependency — native browser `EventSource` cannot send the `Authorization`
  Bearer header this app's auth relies on). On each event it writes directly
  into the TanStack Query cache (unread count, notification list) — no
  component manages its own connection.
- `NotificationBell` component: replaces the inert `Bell` button in
  `HomeTopBar` with a dropdown showing a **live-updating** unread badge, the
  most recent notifications (title built from `type` + `payload`, relative
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
- A **coarse polling fallback** (e.g. every 5 min) alongside the SSE
  connection — insurance against a silently stalled stream (a corporate
  proxy that buffers `text/event-stream`, a laptop waking from sleep with a
  dead socket the browser hasn't noticed yet). SSE is the primary path;
  polling here is a safety net, not the mechanism.

### Out of Scope

- Making the bell appear on every screen (currently only `HomeTopBar` has
  one; other screens use bare `ScreenHeader` with no notifications slot).
  Filling every screen's header is a natural follow-up once product wants
  persistent access outside Home, not required to ship this integration.
- Any change to `gardenia-api` beyond consuming the `notifications-module`
  API (including its new `GET /notifications/stream`) as specified. If that
  change hasn't landed yet, this change blocks on it (see Dependencies).
- Toast/desktop push notifications, sound, or browser Notification API
  integration — SSE only works while a tab is open; true push (closed-tab)
  notifications remain a later phase on both sides.
- User-configurable preferences (mute a type, change windows) — matches the
  API's v1 scope, which has no such settings to surface.
- Reconnection backoff tuning beyond `fetch-event-source`'s sane defaults —
  revisit only if real-world reconnect behavior proves it's needed.

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
- **The SSE connection goes through the existing same-origin proxy**
  (`app/api/[...path]/route.ts` → `proxyTo()`), exactly like every other
  REST call — not directly at the API's origin. `proxyTo()` already streams
  (`new NextResponse(upstream.body, ...)`, no buffering), so no proxy code
  changes; this is called out explicitly in Design because it's the one
  piece of existing infrastructure this change depends on behaving a
  specific way, and it's worth a manual verification during implementation
  regardless of the static-read confirmation.
- **One shared connection, not one per component.** `NotificationBell`,
  `NotificationsScreen`, etc. never open their own `EventSource`/
  `fetch-event-source` call — they read from TanStack Query, which
  `NotificationsProvider` keeps fresh. This avoids N duplicate streaming
  connections when N notification-related components are mounted at once.

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
| `notifications-module` (API) ships with a different field/enum shape than assumed here | Med | This change is written against that change's `design.md` contracts; if the API shape changes before this lands, only the GraphQL repository + response/SSE-event types need updating, not the use-cases/hooks/components (hexagonal boundary absorbs the change) |
| `payload` shape drifts silently (API adds/renames a field the web reads) | Low | `buildNotificationMessage` reads `payload` defensively (optional chaining, fallback generic text) rather than assuming presence; a mismatch degrades to a generic message, not a crash |
| SSE connection silently stalls (proxy buffering, sleeping laptop, flaky network) and the badge goes stale | Med | Coarse polling fallback (5 min) catches anything SSE misses; `fetch-event-source`'s built-in reconnect (exponential backoff) recovers the primary path without user action |
| A reverse proxy or CDN in front of the deployed Next.js server buffers `text/event-stream` responses, breaking real-time delivery in production even though it works locally | Med | Flagged explicitly for whoever configures production infra (needs `X-Accel-Buffering: no` / buffering disabled for `/api/notifications/stream`, same requirement documented on the API side); the polling fallback keeps the feature functional (just not real-time) even if this is missed initially |
| Multiple browser tabs for the same user each open their own SSE connection, multiplying server-side connections for one human | Low | Acceptable at current scale (a handful of tabs per user, not thousands); `NotificationsProvider` at least ensures it's one connection per *tab*, not per component within a tab |

## Dependencies

- **Blocks on `sisques-labs/gardenia-api`'s `notifications-module` change**
  being implemented and deployed (or at minimum, its GraphQL schema —
  `notificationsFindByCriteria`, `notificationsUnreadCount`,
  `notificationMarkRead`, `notificationsMarkAllRead` — plus `GET
  /notifications/stream` — being available in the environment this is
  developed/tested against).
- **New dependency: `@microsoft/fetch-event-source`** — the only viable way
  to consume an authenticated (Bearer header) SSE stream from the browser;
  native `EventSource` cannot set custom request headers.
- Reuses `Filter<TField>`/`FilterOperator` (`shared/domain/`), `apolloClient`,
  the axios auth-header logic (the same token/space-id resolution the axios
  interceptor uses, factored out so the SSE client can reuse it without
  going through axios itself), TanStack Query conventions, `ScreenHeader`,
  shadcn `DropdownMenu`/`Badge`, and the existing same-origin proxy
  (`app/api/[...path]/route.ts`).

## Success Criteria

- [ ] `HomeTopBar`'s bell shows an unread-count badge that updates in
      real time (within a couple seconds) when a new notification arrives
      server-side, with no page reload and no visible polling delay.
- [ ] Clicking the bell opens a dropdown of recent notifications with
      human-readable text per type; clicking a row marks it read and
      updates the badge immediately in that tab, and within a couple seconds
      in any other open tab for the same user via SSE.
- [ ] "Marcar todas como leídas" clears the badge and the dropdown's unread
      indicators without a full page reload.
- [ ] `/notifications` lists the user's own notifications only, with
      working Unread/All tabs and pagination.
- [ ] If the SSE connection is unavailable or drops, the app still functions
      (list/mark-read work normally) and the coarse polling fallback catches
      up the badge within its interval — no hard dependency on SSE for
      correctness, only for latency.
- [ ] `pnpm test`, `pnpm lint`, `pnpm tsc --noEmit` green; `notifications`
      module has an `i18n-parity.test.ts` passing for `en`/`es`.
