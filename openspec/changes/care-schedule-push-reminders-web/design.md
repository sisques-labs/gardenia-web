# Design: care-schedule-push-reminders-web

## 1. Layer map

```
public/
  sw.js                                     — NEW: hand-rolled service worker, static file

src/core/notifications/
  domain/
    interfaces/push-subscription-keys.interface.ts   — { p256dh: string; auth: string }
    interfaces/push-subscription-status.interface.ts — union type, see §3
  application/
    ports/notifications.repository.port.ts   — INotificationsRepository
    interfaces/register-push-subscription-input.interface.ts
    use-cases/register-push-subscription/register-push-subscription.use-case.ts
    use-cases/unregister-push-subscription/unregister-push-subscription.use-case.ts
  infrastructure/
    repositories/graphql/notifications.gql.repository.ts
    repositories/graphql/mutations/register-push-subscription.mutation.ts
    repositories/graphql/mutations/unregister-push-subscription.mutation.ts
    push/push-manager.ts                     — browser Push API wrapper (no framework dep)
    service-worker/register-service-worker.ts — navigator.serviceWorker.register('/sw.js')
  presentation/
    hooks/use-push-notifications/usePushNotifications.hook.ts
    components/push-notifications-card/push-notifications-card.tsx
    components/push-notifications-card/push-notifications-card.stories.tsx
    providers/notifications.providers.tsx      — mounts the eager SW registration (see §4)
    i18n/en.ts
    i18n/es.ts
    i18n/i18n-parity.test.ts

src/core/users/presentation/screens/user-profile/user-profile.screen.tsx  — MODIFIED: renders <PushNotificationsCard />
src/shared/presentation/providers/providers.tsx                          — MODIFIED: + NotificationsProviders
src/shared/config/env.ts                                                  — MODIFIED: + WEB_PUSH_VAPID_PUBLIC_KEY
```

Cross-layer rules respected: `domain` is pure types, no framework. `push-manager.ts`
and `register-service-worker.ts` live in `infrastructure/` (they touch
browser globals, not React) even though they're not GraphQL — this context's
"infrastructure" is "anything that touches a platform API we don't control,"
same spirit as `infrastructure/http/` holding the axios/Apollo clients.
`usePushNotifications` (presentation) is the only place that composes
browser state + the two use-cases + React state — mirrors every other
TanStack-Query-wrapping hook in this codebase.

## 2. ADR-001 — Hand-rolled `sw.js`, not `next-pwa`/`@ducanh2912/next-pwa`

**Decision**: a static 20-ish line `public/sw.js`, registered manually via
`navigator.serviceWorker.register('/sw.js')`. No build-time SW-generation
plugin.

**Rationale**: this app does not want an offline-first caching strategy —
`public/site.webmanifest` already covers "installable," and adding a
caching SW changes what happens on every navigation/asset request (stale-
while-revalidate semantics, cache invalidation on deploy) for a feature that
only needs to *receive push events*. A `next-pwa`-style plugin would solve a
problem we don't have while adding a real one (cache invalidation bugs
across deploys). The service worker here does exactly two things:

```js
// public/sw.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Gardenia', {
      body: data.body,
      icon: '/icon-192.png',
      data: { url: data.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(clients.openWindow(url));
});
```

**Rejected alternative**: `next-pwa`. Rejected — adds a dependency and a
build-time code-gen step for capabilities (offline caching, precaching) this
change does not need.

## 3. `usePushNotifications` — state machine

```ts
type PushNotificationStatus =
  | 'unsupported'   // no serviceWorker/PushManager/Notification in this browser
  | 'denied'        // Notification.permission === 'denied'
  | 'disabled'      // permission default or granted, but not subscribed
  | 'enabled'        // subscribed (registration.pushManager.getSubscription() !== null)
  | 'pending'       // enabling/disabling in flight
  | 'error';
```

On mount, the hook checks (no side effects, no permission prompt):
1. Feature support (`'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window`) → `unsupported` if false.
2. `Notification.permission === 'denied'` → `denied`.
3. Otherwise, await the already-registered SW (registered eagerly, see §4)
   and call `registration.pushManager.getSubscription()` → `enabled` if a
   subscription exists, else `disabled`.

`enable()` (called only from a user click, never automatically — permission
prompts triggered without a user gesture are typically auto-rejected by
browsers and are bad UX regardless):
1. `Notification.requestPermission()` — if not `'granted'`, set `denied` and stop.
2. `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(WEB_PUSH_VAPID_PUBLIC_KEY) })`.
3. `registerPushSubscriptionUseCase.execute({ endpoint, p256dh, auth, userAgent: navigator.userAgent })`.
4. Set `enabled`; on any failure at any step, set `error` and surface a toast/inline alert (subscribing is rolled back client-side by calling `subscription.unsubscribe()` if the backend call in step 3 fails, so the browser and server never disagree about state).

`disable()`:
1. Look up the current subscription's `endpoint` (still available from the browser subscription object).
2. `unregisterPushSubscriptionUseCase.execute({ endpoint })` — note: the use case resolves the api-side `id` by endpoint; see §5 for why the api's `DELETE /push-subscriptions/:id` needs an endpoint-based lookup path or a small adjustment (flagged in §6 Open Question).
3. `subscription.unsubscribe()` (browser-side).
4. Set `disabled`.

## 4. Eager SW registration vs. on-click permission request

**Decision**: `navigator.serviceWorker.register('/sw.js')` runs eagerly, once,
from `NotificationsProviders` (a client component mounted at the root via
`shared/presentation/providers/providers.tsx`, same aggregation pattern
every other module's providers use). This is registration only — it does
NOT prompt for permission and is invisible to the user. `Notification.requestPermission()`
(the actual permission prompt) fires exclusively from the `PushNotificationsCard`'s
"Enable" button click — a real user gesture, which is both the browser-required
pattern for a permission prompt to reliably appear and the correct UX (no
surprise prompts on page load).

## 5. `PushNotificationsCard` states → copy

| Status | UI |
|--------|-----|
| `unsupported` | Disabled section, muted copy: "Push notifications aren't supported in this browser." |
| `denied` | Disabled section, copy explaining the browser blocked it and how to re-enable from browser settings (no in-app retry — browsers do not allow re-prompting a denied permission via JS) |
| `disabled` | "Enable" button |
| `enabled` | Confirmation copy + "Disable" button |
| `pending` | Both buttons disabled, spinner |
| `error` | Inline `Alert` with a generic retry-safe message; button returns to its pre-attempt state |

## 6. Open Question (flag for the api change's reviewer, not blocking here)

The api's `DELETE /push-subscriptions/:id` takes the subscription's **id**,
but the browser only ever hands the frontend an **endpoint** (`PushSubscription.endpoint`),
never the api's internal id. Two options, to confirm before/alongside the
api change's Phase 4:
- (a) the frontend never learns the `id` — `registerPushSubscription`'s
  response already returns the created/updated row, so the register-time
  response's `id` can be cached client-side (e.g. in the same TanStack Query
  cache entry `usePushNotifications` reads on mount) for later use by `disable()`.
- (b) add an endpoint-keyed unregister path (`DELETE /push-subscriptions?endpoint=...`
  or a GraphQL `unregisterPushSubscriptionByEndpoint`) instead of by id.

This design assumes **(a)** (no api change needed) — `RegisterPushSubscriptionCommand`'s
response already includes the row's `id` per the api's own
`MutationResponseDto` conventions, and `usePushNotifications` persists it
(e.g. via the same query cache key used for status) between the enable and
disable calls in the same session. If a user disables from a *different*
browser tab/session that never called `enable()` in this session, `disable()`
falls back to a "not currently tracked, nothing to do — the browser subscription
is unsubscribed and the stale api-side row will self-clean the next time the
api attempts delivery and gets a 410" note in the code (acceptable given
`SendPushNotificationCommand`'s existing expired-subscription cleanup).

## 7. Testing plan (Strict TDD)

- `push-manager.spec.ts` — pure infra unit test mocking `navigator.serviceWorker`/
  `PushManager`/`Notification` globals (jsdom does not implement the Push API;
  define minimal mocks per test, e.g. `Object.defineProperty(window, 'Notification', ...)`).
- `register-push-subscription.use-case.spec.ts` / `unregister-...` — mocked
  port, happy path + error propagation.
- `notifications.gql.repository.spec.ts` — mocks `apolloClient.mutate` directly
  (existing pattern), asserts gql document + variables.
- `usePushNotifications.hook.spec.ts` (or `.test.tsx`) — all five states
  reachable via mocked browser globals + mocked use-cases; `enable()` rolls
  back the browser subscription if the backend call rejects.
- `push-notifications-card.test.tsx` — renders each status's copy/buttons;
  click "Enable" calls the hook's `enable()`.
- `push-notifications-card.stories.tsx` — mandatory per storybook rule; since
  the component calls a hook with real browser API dependencies, seed via a
  decorator that stubs the relevant `navigator`/`window` globals per story
  (one story per status) rather than mocking the hook module, per the existing
  hook-backed-component storybook convention.
- `user-profile.screen.spec.tsx` (extend) — renders `PushNotificationsCard`
  in the profile screen.
- `i18n-parity.test.ts` (new, `notifications` module) — both locales have the
  same keys.

## 8. Risks

1. **Sequencing with the api change** — see proposal's Rollback.
2. **Browser support gaps** — Safari on iOS requires the site to be installed
   as a Home Screen PWA before Web Push works at all; the card will simply
   read `unsupported` there until installed. No special-casing/detection of
   "installable but not installed yet" in v1.
3. **HTTPS requirement** — the Push API requires a secure context; this is
   already satisfied in production and `localhost` is exempt in dev, so no
   action needed, just noted as a non-issue rather than an unstated assumption.
4. **Permission denied is unrecoverable in-app** — by design of the browser
   permission model, not fixable in this change; copy must set that
   expectation clearly (see §5).
