# Notifications (web) — Push opt-in

**Source change:** care-schedule-push-reminders-web
**Created:** 2026-07-21
**Depends on:** `gardenia-api` change `care-schedule-push-reminders`

---

## Requirements

### Requirement: Feature Detection

The system MUST detect whether the current browser supports Web Push
(`serviceWorker`, `PushManager`, and `Notification` all present) before
offering the opt-in control, and MUST render a disabled, explanatory state
when unsupported instead of a non-functional button.

#### Scenario: Unsupported browser

- GIVEN a browser without `PushManager`
- WHEN the profile screen renders `PushNotificationsCard`
- THEN the card shows the "not supported" copy and no enable button

---

### Requirement: Eager Service Worker Registration

The system MUST register `/sw.js` once, on app load, without requesting
notification permission and without any user-visible prompt.

#### Scenario: Registration on load

- GIVEN a supported browser
- WHEN the app loads
- THEN `navigator.serviceWorker.register('/sw.js')` is called without any permission prompt appearing

---

### Requirement: Permission Request Gated Behind User Action

The system MUST only call `Notification.requestPermission()` in direct
response to the user clicking "Enable" — never automatically.

#### Scenario: No prompt without a click

- GIVEN a supported browser with default permission
- WHEN the profile screen renders
- THEN no permission prompt appears until the user clicks "Enable"

---

### Requirement: Enable Push Notifications

Clicking "Enable" MUST, in order: request permission; if granted, subscribe
via `PushManager` using the configured VAPID public key; register the
resulting subscription with the backend
(`registerPushSubscription` mutation). If the backend call fails, the system
MUST unsubscribe the browser-side subscription so browser and server state
never diverge.

#### Scenario: Successful enable

- GIVEN a supported browser with default permission
- WHEN the user clicks "Enable" and grants permission
- THEN a push subscription is created and registered with the backend, and the card shows the enabled state

#### Scenario: Permission denied during enable

- GIVEN the user clicks "Enable"
- WHEN they deny the permission prompt
- THEN the card shows the denied state and no subscription is created

#### Scenario: Backend registration fails

- GIVEN the browser subscription succeeds
- WHEN the `registerPushSubscription` mutation fails
- THEN the browser-side subscription is unsubscribed and the card shows an error state

---

### Requirement: Disable Push Notifications

Clicking "Disable" MUST unregister the subscription from the backend and
unsubscribe it from the browser.

#### Scenario: Successful disable

- GIVEN an active subscription
- WHEN the user clicks "Disable"
- THEN the backend subscription is unregistered, the browser subscription is unsubscribed, and the card returns to the disabled state

---

### Requirement: Denied Permission Messaging

When `Notification.permission === 'denied'`, the system MUST show copy
explaining the browser blocked the permission and that re-enabling requires
a browser-settings change — the system MUST NOT attempt to re-prompt (browsers
do not allow re-prompting a denied permission via script).

#### Scenario: Denied state copy

- GIVEN `Notification.permission` is `'denied'`
- WHEN the card renders
- THEN it shows the browser-settings explanation and no enable button

---

### Requirement: Push Receipt

The service worker MUST display a `Notification` for every `push` event
using the payload's `title`/`body`, and MUST focus or open the app to the
payload's `url` on `notificationclick`.

#### Scenario: Push displayed

- GIVEN a registered service worker
- WHEN a `push` event is received with `{ title, body, url }`
- THEN a system notification is shown with that title and body

#### Scenario: Click opens the deep link

- GIVEN a displayed notification with a `url` in its data
- WHEN the user clicks it
- THEN the app opens/focuses at that `url`

---

## Out of Scope

- Per-schedule/per-plant notification preferences.
- A notification history/inbox.
- Detecting or special-casing "installable but not yet installed" PWA states.
- Any backend/API behavior — covered by the paired `gardenia-api` change.
