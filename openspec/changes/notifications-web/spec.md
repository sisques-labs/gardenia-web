# Spec: notifications-web

## Capabilities

| Capability | Type | Spec file |
|------------|------|-----------|
| `notifications-web` | New | `specs/notifications-web/spec.md` |
| `home-dashboard` (bell wiring) | Delta | `specs/home-dashboard/spec.md` |

## Summary

This change introduces two deliverables:

1. **notifications-web** — a new `src/core/notifications/` module (GraphQL
   integration, hooks, i18n), a `NotificationBell` component, and a new
   `/notifications` screen consuming `gardenia-api`'s `notifications-module`
   GraphQL API.

2. **home-dashboard delta** — `HomeTopBar`'s inert placeholder `Bell` button
   (reserved since `dashboard-home`) becomes the real `NotificationBell`.

## Requirements Coverage

| ID | Domain | Name | Type |
|----|--------|------|------|
| REQ-NW-01 | notifications-web | Notification Module Boundary | Added |
| REQ-NW-02 | notifications-web | NotificationFindByCriteria Filters | Added |
| REQ-NW-03 | notifications-web | Unread Count Polling | Added |
| REQ-NW-04 | notifications-web | Mark Read / Mark All Read | Added |
| REQ-NW-05 | notifications-web | Notification Message Building | Added |
| REQ-NW-06 | notifications-web | Notifications Screen | Added |
| REQ-HD-06 | home-dashboard | HomeTopBar Bell Becomes Functional | Modified |

## Scenarios Coverage

See `specs/notifications-web/spec.md` and `specs/home-dashboard/spec.md` for
full Given/When/Then scenarios per requirement.
