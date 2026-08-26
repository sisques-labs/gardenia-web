# Proposal: care-schedule-push-reminders-web

## Intent

Paired with the `gardenia-api` change of the same name
(`care-schedule-push-reminders`), which adds a `notifications` bounded
context (Web Push subscription register/unregister) and wires
`care-schedule` to send an immediate push the moment a task becomes due.
Today gardenia-web has zero push infrastructure: no service worker, no
`Notification`/`PushManager` usage, only the baseline PWA metadata
(`public/site.webmanifest` + icons, already present, unused beyond the
installability tag). This change adds the minimum needed for a user to opt
in to push reminders: a service worker that displays incoming pushes, and an
enable/disable control in the existing profile screen.

**Sequencing dependency**: this change calls the paired api change's new
`registerPushSubscription`/`unregisterPushSubscription` GraphQL mutations.
It should not be deployed ahead of (or without) that api change — see
Rollback.

## Scope

- New **`notifications`** bounded context under `src/core/notifications/`
  (domain → application → infrastructure → presentation), scoped to: is push
  supported in this browser, has the user granted permission, are we
  subscribed, enable, disable.
- New static `public/sw.js` — a small, hand-rolled service worker (no
  `next-pwa`/build-plugin dependency) that listens for `push` (shows a
  `Notification` from the payload) and `notificationclick` (focuses/opens the
  app, navigating to the payload's `url` if present).
- New `presentation/hooks/use-push-notifications/usePushNotifications.hook.ts`:
  wraps browser Push API calls (`navigator.serviceWorker`,
  `Notification.requestPermission`, `PushManager.subscribe`) + the two
  backend mutations behind a single state machine:
  `unsupported | denied | enabled | disabled | pending | error`.
- New `presentation/components/push-notifications-card/PushNotificationsCard`
  (+ mandatory `.stories.tsx`), rendered inside the existing
  `UserProfileScreen` (`src/core/users/presentation/screens/user-profile/`) —
  this is user-scoped settings, not space-scoped, so it belongs on `/profile`,
  not the space `/settings` screen.
- New env var `NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY` (the VAPID public key
  the api change generates server-side; only the public half is ever sent to
  the browser).
- i18n: new `notifications.*` keys (`en`/`es`) — card title/description,
  button labels per state, the "denied" explanation copy, the "unsupported
  browser" copy.

## Out of Scope

- Any `gardenia-api` change — covered by the paired api proposal.
- Per-schedule or per-plant notification preferences — this is a single
  global on/off per user (matches the api's v1 scope: existence of a
  subscription = opted in).
- A generic "notification center"/in-app inbox of past notifications.
- Any change to `next.config.ts`'s build output or a full offline/PWA caching
  strategy — `sw.js` only handles `push`/`notificationclick`, nothing else.
- Handling the case where the browser's permission was denied — the only
  in-app affordance is explanatory copy ("blocked in browser settings");
  there is no in-app way to re-request a denied permission (a browser/OS
  limitation, not a scoping choice we can undo).
- iOS Safari's "must be installed as a Home Screen app first" requirement —
  out of scope to detect/special-case in v1; the card simply won't work there
  until installed, same as any other web push implementation.

## Rollback

Additive: new context, new static file, one new section in an existing
screen, one new env var. Rollback = revert the branch; no data, no schema,
no existing screen behavior changes outside the new card.

Because this change's two mutation calls only succeed once the paired api
change is live:
- If the api change has NOT shipped yet: the card's "Enable" action will
  fail (mutation not found / 400). Either sequence the deploy after the api
  change, or ship this change with the card temporarily behind a simple env
  check (`NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY` unset → card renders nothing)
  so an out-of-order deploy degrades to "feature invisible" rather than
  "feature visibly broken."
- If the api change HAS shipped: reverting this PR simply removes the opt-in
  UI; any subscriptions already registered server-side become unreachable
  from the UI (they are not deleted) but do no harm — the api's cron will
  simply keep trying to deliver to them until they naturally expire and
  self-unregister (see the api change's 404/410 handling).
