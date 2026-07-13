# Spec: notifications-web

## Capabilities

| Capability | Type | Spec file |
|------------|------|-----------|
| `notifications-web` | New | `specs/notifications-web/spec.md` |
| `home-dashboard` (bell wiring) | Delta | `specs/home-dashboard/spec.md` |

## Summary

This change introduces two deliverables:

1. **notifications-web** — a new `src/core/notifications/` module (GraphQL
   for list/mark-read/mark-all-read, plus an SSE client for real-time
   delivery), a `NotificationsProvider` owning the single shared SSE
   connection, a `NotificationBell` component, and a new `/notifications`
   screen — consuming `gardenia-api`'s `notifications-module` GraphQL API
   and its `GET /notifications/stream` SSE endpoint.

2. **home-dashboard delta** — `HomeTopBar`'s inert placeholder `Bell` button
   (reserved since `dashboard-home`) becomes the real `NotificationBell`,
   now live-updating via the SSE connection rather than on a fixed poll.

## Requirements Coverage

| ID | Domain | Name | Type |
|----|--------|------|------|
| REQ-NW-01 | notifications-web | Notification Module Boundary | Added |
| REQ-NW-02 | notifications-web | NotificationFindByCriteria Filters | Added |
| REQ-NW-03 | notifications-web | Real-Time Delivery via SSE | Added |
| REQ-NW-03b | notifications-web | Fallback Polling | Added |
| REQ-NW-04 | notifications-web | Mark Read / Mark All Read | Added |
| REQ-NW-05 | notifications-web | Notification Message Building | Added |
| REQ-NW-06 | notifications-web | Notifications Screen | Added |
| REQ-HD-06 | home-dashboard | HomeTopBar Bell Becomes Functional | Modified |

## Scenarios Coverage

See `specs/notifications-web/spec.md` and `specs/home-dashboard/spec.md` for
full Given/When/Then scenarios per requirement.
