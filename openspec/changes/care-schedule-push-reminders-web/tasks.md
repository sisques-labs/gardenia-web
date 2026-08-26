# Tasks: care-schedule-push-reminders-web

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 700 – 950 |
| 400-line budget risk | Med |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → `notifications` context (domain/application/infrastructure) + `sw.js` · PR 2 → presentation (hook, card, providers, profile screen wiring) + i18n · PR 3 → Tests |
| Delivery strategy | ask-on-risk |

---

## Phase 1: Domain + Application

- [ ] 1.1 Create `src/core/notifications/domain/interfaces/push-subscription-keys.interface.ts` — `{ p256dh: string; auth: string }`
- [ ] 1.2 Create `src/core/notifications/domain/interfaces/push-subscription-status.interface.ts` — `PushNotificationStatus` union type (see design.md §3)
- [ ] 1.3 Create `src/core/notifications/application/interfaces/register-push-subscription-input.interface.ts` — `{ endpoint: string; p256dh: string; auth: string; userAgent?: string }`
- [ ] 1.4 Create `src/core/notifications/application/ports/notifications.repository.port.ts` — `INotificationsRepository { registerPushSubscription(input): Promise<CreatedEntity>; unregisterPushSubscription(id: string): Promise<void> }` (returns `CreatedEntity` per the repo's mandatory "no needless re-fetch" rule)
- [ ] 1.5 Create `src/core/notifications/application/use-cases/register-push-subscription/register-push-subscription.use-case.ts` — `RegisterPushSubscriptionUseCase`, takes the port via constructor
- [ ] 1.6 Create `src/core/notifications/application/use-cases/unregister-push-subscription/unregister-push-subscription.use-case.ts` — `UnregisterPushSubscriptionUseCase`

---

## Phase 2: Infrastructure

- [ ] 2.1 Create `public/sw.js` — `push` + `notificationclick` listeners (design.md §2)
- [ ] 2.2 Create `src/core/notifications/infrastructure/repositories/graphql/mutations/register-push-subscription.mutation.ts` — gql document
- [ ] 2.3 Create `src/core/notifications/infrastructure/repositories/graphql/mutations/unregister-push-subscription.mutation.ts` — gql document
- [ ] 2.4 Create `src/core/notifications/infrastructure/repositories/graphql/notifications.gql.repository.ts` — `NotificationsGqlRepository implements INotificationsRepository`, singleton export `notificationsGqlRepository`
- [ ] 2.5 Create `src/core/notifications/infrastructure/push/push-manager.ts` — `isPushSupported()`, `getPermission()`, `requestPermission()`, `getExistingSubscription(registration)`, `subscribe(registration, vapidPublicKey)`, `urlBase64ToUint8Array(base64: string): Uint8Array` (VAPID key format conversion helper)
- [ ] 2.6 Create `src/core/notifications/infrastructure/service-worker/register-service-worker.ts` — `registerServiceWorker(): Promise<ServiceWorkerRegistration | null>`, no-ops (returns `null`) when unsupported
- [ ] 2.7 Modify `src/shared/config/env.ts` — add `WEB_PUSH_VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY ?? ''`

---

## Phase 3: Presentation

- [ ] 3.1 Create `src/core/notifications/presentation/hooks/use-push-notifications/usePushNotifications.hook.ts` — state machine per design.md §3; `enable()` rolls back the browser subscription on backend failure; `disable()` per design.md §6
- [ ] 3.2 Create `src/core/notifications/presentation/components/push-notifications-card/push-notifications-card.tsx` — `PushNotificationsCard`, renders per-status copy/buttons (design.md §5)
- [ ] 3.3 Create `src/core/notifications/presentation/components/push-notifications-card/push-notifications-card.stories.tsx` — one story per status, stubbing browser globals per story (mandatory storybook rule)
- [ ] 3.4 Create `src/core/notifications/presentation/providers/notifications.providers.tsx` — mounts eager `registerServiceWorker()` on client mount (no permission prompt)
- [ ] 3.5 Modify `src/shared/presentation/providers/providers.tsx` — add `NotificationsProviders` to the aggregator
- [ ] 3.6 Modify `src/core/users/presentation/screens/user-profile/user-profile.screen.tsx` — render `<PushNotificationsCard />` as a new section
- [ ] 3.7 Create `src/core/notifications/presentation/i18n/en.ts` — `NotificationsDict`: card title/description, per-status copy, button labels
- [ ] 3.8 Create `src/core/notifications/presentation/i18n/es.ts` — `satisfies WidenStringLiterals<NotificationsDict>`, Castellano de España
- [ ] 3.9 Create `src/core/notifications/presentation/i18n/i18n-parity.test.ts`
- [ ] 3.10 Modify `src/shared/presentation/i18n/get-dictionary.ts` — import + aggregate `notifications` dict

---

## Phase 4: Tests

- [ ] 4.1 `push-manager.spec.ts` — mocked browser globals, all helper functions
- [ ] 4.2 `register-push-subscription.use-case.spec.ts` / `unregister-push-subscription.use-case.spec.ts`
- [ ] 4.3 `notifications.gql.repository.spec.ts` — mocks `apolloClient` directly
- [ ] 4.4 `usePushNotifications.hook.spec.ts` — all five states; rollback-on-backend-failure path
- [ ] 4.5 `push-notifications-card.test.tsx` — renders each status; click wiring
- [ ] 4.6 `user-profile.screen.spec.tsx` (extend) — includes the new card
- [ ] 4.7 `i18n-parity.test.ts` (new, notifications module) — already created in Phase 3, verify it passes with both locales populated
