# Tasks: notifications-web

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~950 (domain+application ~100, GQL infra ~180, SSE infra + provider ~150, hooks ~100, componentes ~200, i18n ~70, integración en Providers/HomeTopBar + ruta nueva ~90) |
| 400-line budget risk | High — dividir en PRs encadenadas |
| Chained PRs recommended | Yes |
| Delivery strategy | PR 1: módulo domain/application/infraestructura GraphQL + hooks (sin SSE aún — el módulo funciona con la caché fría, se actualiza al montar/reenfocar). PR 2: infraestructura SSE (`fetch-event-source`, cliente, `NotificationsProvider`) + su integración en `providers.tsx`. PR 3: componentes (`NotificationRow`, `NotificationBell`, `NotificationList`) + integración en `HomeTopBar`. PR 4: pantalla completa `/notifications`. |

---

## Phase 1: Dominio + Aplicación

- [ ] 1.1 Crear `src/core/notifications/domain/types/notification.interface.ts` — `NOTIFICATION_TYPES`, `NotificationType`, `NOTIFICATION_STATUSES`, `NotificationStatus`, `Notification`. Ver diseño §2.
- [ ] 1.2 Crear `src/core/notifications/domain/enums/notification-queryable-field.enum.ts` — `NotificationQueryableField` (`TYPE = 'type'`, `STATUS = 'status'`), mismo patrón que `CareScheduleQueryableField`.
- [ ] 1.3 Crear `application/interfaces/notification-filters.interface.ts` — `NotificationFilters`. Ver diseño §3.
- [ ] 1.4 **[RED]** Escribir specs de los 4 use-cases (`get-notifications`, `get-notifications-unread-count`, `mark-notification-read`, `mark-all-notifications-read`), mock del puerto `INotificationRepository`. Assert: cada use-case delega en el método correcto con los argumentos recibidos.
- [ ] 1.5 **[GREEN]** Crear `application/ports/notification.repository.port.ts` (`INotificationRepository`) y los 4 use-cases.
- [ ] 1.6 **[REFACTOR]** Confirmar que ningún archivo de esta fase importa de React, Zustand, Apollo, ni de `src/core/care-schedule` o `src/core/inventory`.

---

## Phase 2: Infraestructura GraphQL

- [ ] 2.1 Crear `queries/notifications-find-by-criteria.query.ts` y `queries/notifications-unread-count.query.ts`.
- [ ] 2.2 Crear `mutations/notification-mark-read.mutation.ts` y `mutations/notifications-mark-all-read.mutation.ts`.
- [ ] 2.3 Crear tipos de respuesta en `responses/` para cada query/mutation.
- [ ] 2.4 **[RED]** Escribir `notification.gql.repository.spec.ts` — mock `apolloClient` (`vi.mock`). Casos: `findByCriteria()` sin filtros, `findByCriteria({ status: 'UNREAD' })` → filtro `status`/`EQUALS`, `findByCriteria({ type: 'INVENTORY_LOW_STOCK' })` → filtro `type`/`EQUALS`, `unreadCount()`, `markRead(id)` → variables `{ id }`, `markAllRead()` → sin variables.
- [ ] 2.5 **[GREEN]** Crear `notification.gql.repository.ts` implementando `INotificationRepository`. Ver diseño §4. Exportar singleton `notificationGqlRepository`.
- [ ] 2.6 **[REFACTOR]** Confirmar que la traducción camelCase→snake_case/GraphQL-enum de filtros vive solo aquí.

---

## Phase 3: Infraestructura SSE

- [ ] 3.1 Ejecutar `pnpm add @microsoft/fetch-event-source`.
- [ ] 3.2 Crear `infrastructure/realtime/notification-sse-event.interface.ts` — `NotificationSseEventType`, `NotificationSseEvent`. Ver diseño §5.
- [ ] 3.3 **[RED]** Escribir `notifications-sse.client.spec.ts` — mock de `fetch-event-source` (`vi.mock('@microsoft/fetch-event-source')`). Casos: llama a `fetchEventSource` con la URL `/api/notifications/stream`, cabeceras `Authorization`/`X-Space-ID` correctas y el `signal` recibido; `onmessage` con `event: 'heartbeat'` NO llama a `onEvent`; `onmessage` con cualquier otro evento parsea `data` y llama a `onEvent` con el resultado.
- [ ] 3.4 **[GREEN]** Crear `infrastructure/realtime/notifications-sse.client.ts` — `connectNotificationsStream(params)`. Ver diseño §5.
- [ ] 3.5 **[REFACTOR]** Confirmar que este archivo no importa React, Zustand ni TanStack Query — solo `fetch-event-source` y los tipos del propio módulo.
- [ ] 3.6 **[RED]** Escribir `notifications.providers.spec.tsx` — mock de `connectNotificationsStream` y de los stores. Casos: no conecta si `currentSpaceId` es `null`; conecta al montar con un `spaceId` presente, pasando ese `spaceId` y un `getAccessToken` que lee del auth store; un evento recibido invalida `['notifications', spaceId]` y `['notifications-unread-count', spaceId]`; cambiar `spaceId` (rerender con otro valor) aborta la conexión anterior (`AbortController.abort` llamado) y conecta con el nuevo; desmontar el provider aborta la conexión.
- [ ] 3.7 **[GREEN]** Crear `presentation/providers/notifications.providers.tsx` — `NotificationsProvider`. Ver diseño §6/§7.

---

## Phase 4: Hooks de presentación

- [ ] 4.1 **[RED]** Escribir specs de `use-notifications`, `use-notifications-unread-count`, `use-mark-notification-read`, `use-mark-all-notifications-read` (mock de use-cases). Cubrir: `useNotifications` respeta `enabled: !!spaceId` y usa `filters` en la query key; `useNotificationsUnreadCount` configura `refetchInterval: FALLBACK_POLL_INTERVAL_MS` (5 min, no un intervalo corto — SSE es el camino principal, esto es solo la red de seguridad); ambas mutaciones invalidan `['notifications', spaceId]` y `['notifications-unread-count', spaceId]` en éxito.
- [ ] 4.2 **[GREEN]** Crear los 4 hooks. Ver diseño §6.

---

## Phase 5: Componentes

- [ ] 5.1 Crear `presentation/utils/build-notification-message/build-notification-message.util.ts` — `switch (type)` sobre los 3 tipos v1, interpola `payload`, fallback genérico si falta un campo esperado.
- [ ] 5.2 **[RED]** Escribir `build-notification-message.util.spec.ts` — un caso por tipo con payload completo, un caso de payload incompleto → fallback.
- [ ] 5.3 **[GREEN]** Implementar el util contra los specs.
- [ ] 5.4 **[RED]** Escribir `notification-row.test.tsx` — renderiza texto correcto, icono por tipo, indicador no-leída visible solo si `status === 'UNREAD'`, click dispara `onMarkRead(id)`.
- [ ] 5.5 **[GREEN]** Crear `presentation/components/notification-row/notification-row.tsx`.
- [ ] 5.6 **[RED]** Escribir `notification-bell.test.tsx` — badge oculto con `unreadCount === 0`, visible con el número si `> 0` (mock `useNotificationsUnreadCount`); abrir el dropdown llama a `useNotifications`; click en fila llama `useMarkNotificationRead`; botón "marcar todas" llama `useMarkAllNotificationsRead`; enlace "ver todas" apunta a `/${locale}/notifications`.
- [ ] 5.7 **[GREEN]** Crear `presentation/components/notification-bell/notification-bell.tsx` (usa `Popover`/`DropdownMenu` + `NumericBadge` de `shared/presentation/components/ui/`).
- [ ] 5.8 **[REFACTOR]** Confirmar que `NotificationBell` no exporta nada que exponga los hooks/repos internos — su superficie pública es solo props (`ariaLabel`, `dict`).

---

## Phase 6: i18n

- [ ] 6.1 Crear `presentation/i18n/en.ts` — claves: título del dropdown, "marcar todas como leídas", "ver todas", estado vacío, textos por tipo de notificación (`careScheduleDue`, `inventoryLowStock`, `inventoryExpiringSoon`), tabs Unread/All de la pantalla completa.
- [ ] 6.2 Crear `presentation/i18n/es.ts` — Castellano de España, tuteo, `satisfies WidenStringLiterals<NotificationsDict>`.
- [ ] 6.3 **[RED]** Escribir `i18n-parity.test.ts`.
- [ ] 6.4 **[GREEN]** Confirmar paridad de claves entre `en`/`es`.
- [ ] 6.5 Registrar el slice `notifications` en `src/shared/presentation/i18n/get-dictionary.ts`.

---

## Phase 7: Integración en `Providers` + `HomeTopBar`

- [ ] 7.1 **[RED]** Actualizar/crear `providers.spec.tsx` (o el spec existente de `Providers`) — asertar que `NotificationsProvider` envuelve a los hijos dentro de `AuthProviders`.
- [ ] 7.2 **[GREEN]** Editar `src/shared/presentation/providers/providers.tsx` — envolver con `<NotificationsProvider>` dentro de `<AuthProviders>`.
- [ ] 7.3 **[RED]** Actualizar `home-top-bar.spec.tsx` — reemplazar la aserción sobre el `Bell` inerte por: el badge de no-leídas se renderiza (mock del hook de conteo), y al hacer click se abre el dropdown de `NotificationBell`.
- [ ] 7.4 **[GREEN]** Editar `home-top-bar.tsx` — sustituir el `<Button><Bell/></Button>` (líneas 51–53) por `<NotificationBell ariaLabel={dict.topbar.notifications} dict={notificationsDict} />`; añadir `notificationsDict` a las props de `HomeTopBar` (pasado desde `home.screen.tsx`, que ya recibe el dict raíz).
- [ ] 7.5 **[REFACTOR]** Confirmar que `home-top-bar.tsx` no importa nada de `@/core/notifications/application` ni `.../infrastructure` — solo el componente de presentación.

---

## Phase 8: Pantalla completa `/notifications`

- [ ] 8.1 Crear `presentation/components/notification-list/notification-list.tsx` — tabs Unread/All (shadcn `Tabs`), lista paginada de `NotificationRow`, estado vacío.
- [ ] 8.2 **[RED]** Escribir `notification-list.test.tsx` — cambiar de tab cambia el filtro pasado a `useNotifications`; estado vacío visible cuando la lista está vacía.
- [ ] 8.3 **[GREEN]** Implementar `NotificationList` contra los specs.
- [ ] 8.4 Crear `presentation/components/notifications-skeleton/notifications-skeleton.tsx` — `NotificationsSkeleton`, para el `<Suspense fallback>`.
- [ ] 8.5 Crear `presentation/screens/notifications/notifications.screen.tsx` — `NotificationsScreen`, usa `ScreenHeader` + `NotificationList`.
- [ ] 8.6 **[RED]** Escribir `notifications.screen.spec.tsx`.
- [ ] 8.7 **[GREEN]** Implementar `NotificationsScreen` contra el spec.
- [ ] 8.8 Crear `app/[lang]/(protected)/notifications/page.tsx` — Server Component async, resuelve `locale`, pasa el dict slice, envuelve en `<Suspense fallback={<NotificationsSkeleton />}>`.

---

## Phase 9: Verificación final

- [ ] 9.1 `pnpm test` — todas las suites nuevas y las modificadas (`home-top-bar.spec.tsx`, `providers.spec.tsx`) en verde.
- [ ] 9.2 `pnpm lint` y `pnpm tsc --noEmit` limpios.
- [ ] 9.3 Smoke manual en navegador (si hay backend disponible con `notifications-module` + `GET /notifications/stream` desplegados): el badge se actualiza en tiempo real al crear una notificación desde otra pestaña/cliente, sin recargar; dropdown funciona; `/notifications` filtra correctamente; verificar en las herramientas de red del navegador que la conexión a `/api/notifications/stream` permanece abierta (no se cierra y reabre) y que llegan los heartbeats.
- [ ] 9.4 Verificación manual específica de streaming: confirmar que la respuesta no llega bufferizada de golpe (debe verse el primer evento antes de que se complete cualquier heartbeat posterior) — si llega bufferizada, revisar configuración de compresión/buffering en el servidor Node standalone o en cualquier proxy intermedio.
