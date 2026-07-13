# Tasks: notifications-web

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~750 (domain+application ~100, GQL infra ~180, hooks ~120, componentes ~200, i18n ~70, integración en HomeTopBar + ruta nueva ~80) |
| 400-line budget risk | Medium — dividir en PRs encadenadas |
| Chained PRs recommended | Yes |
| Delivery strategy | PR 1: módulo (domain/application/infrastructure/hooks) + i18n. PR 2: componentes (`NotificationRow`, `NotificationBell`, `NotificationList`) + integración en `HomeTopBar`. PR 3: pantalla completa `/notifications`. |

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

## Phase 3: Hooks de presentación

- [ ] 3.1 **[RED]** Escribir specs de `use-notifications`, `use-notifications-unread-count`, `use-mark-notification-read`, `use-mark-all-notifications-read` (mock de use-cases). Cubrir: `useNotifications` respeta `enabled: !!spaceId` y usa `filters` en la query key; `useNotificationsUnreadCount` configura `refetchInterval: 60_000`; ambas mutaciones invalidan `['notifications', spaceId]` y `['notifications-unread-count', spaceId]` en éxito.
- [ ] 3.2 **[GREEN]** Crear los 4 hooks. Ver diseño §5.

---

## Phase 4: Componentes

- [ ] 4.1 Crear `presentation/utils/build-notification-message/build-notification-message.util.ts` — `switch (type)` sobre los 3 tipos v1, interpola `payload`, fallback genérico si falta un campo esperado.
- [ ] 4.2 **[RED]** Escribir `build-notification-message.util.spec.ts` — un caso por tipo con payload completo, un caso de payload incompleto → fallback.
- [ ] 4.3 **[GREEN]** Implementar el util contra los specs.
- [ ] 4.4 **[RED]** Escribir `notification-row.test.tsx` — renderiza texto correcto, icono por tipo, indicador no-leída visible solo si `status === 'UNREAD'`, click dispara `onMarkRead(id)`.
- [ ] 4.5 **[GREEN]** Crear `presentation/components/notification-row/notification-row.tsx`.
- [ ] 4.6 **[RED]** Escribir `notification-bell.test.tsx` — badge oculto con `unreadCount === 0`, visible con el número si `> 0` (mock `useNotificationsUnreadCount`); abrir el dropdown llama a `useNotifications`; click en fila llama `useMarkNotificationRead`; botón "marcar todas" llama `useMarkAllNotificationsRead`; enlace "ver todas" apunta a `/${locale}/notifications`.
- [ ] 4.7 **[GREEN]** Crear `presentation/components/notification-bell/notification-bell.tsx` (usa `Popover`/`DropdownMenu` + `NumericBadge` de `shared/presentation/components/ui/`).
- [ ] 4.8 **[REFACTOR]** Confirmar que `NotificationBell` no exporta nada que exponga los hooks/repos internos — su superficie pública es solo props (`ariaLabel`, `dict`).

---

## Phase 5: i18n

- [ ] 5.1 Crear `presentation/i18n/en.ts` — claves: título del dropdown, "marcar todas como leídas", "ver todas", estado vacío, textos por tipo de notificación (`careScheduleDue`, `inventoryLowStock`, `inventoryExpiringSoon`), tabs Unread/All de la pantalla completa.
- [ ] 5.2 Crear `presentation/i18n/es.ts` — Castellano de España, tuteo, `satisfies WidenStringLiterals<NotificationsDict>`.
- [ ] 5.3 **[RED]** Escribir `i18n-parity.test.ts`.
- [ ] 5.4 **[GREEN]** Confirmar paridad de claves entre `en`/`es`.
- [ ] 5.5 Registrar el slice `notifications` en `src/shared/presentation/i18n/get-dictionary.ts`.

---

## Phase 6: Integración en `HomeTopBar`

- [ ] 6.1 **[RED]** Actualizar `home-top-bar.spec.tsx` — reemplazar la aserción sobre el `Bell` inerte por: el badge de no-leídas se renderiza (mock del hook de conteo), y al hacer click se abre el dropdown de `NotificationBell`.
- [ ] 6.2 **[GREEN]** Editar `home-top-bar.tsx` — sustituir el `<Button><Bell/></Button>` (líneas 51–53) por `<NotificationBell ariaLabel={dict.topbar.notifications} dict={notificationsDict} />`; añadir `notificationsDict` a las props de `HomeTopBar` (pasado desde `home.screen.tsx`, que ya recibe el dict raíz).
- [ ] 6.3 **[REFACTOR]** Confirmar que `home-top-bar.tsx` no importa nada de `@/core/notifications/application` ni `.../infrastructure` — solo el componente de presentación.

---

## Phase 7: Pantalla completa `/notifications`

- [ ] 7.1 Crear `presentation/components/notification-list/notification-list.tsx` — tabs Unread/All (shadcn `Tabs`), lista paginada de `NotificationRow`, estado vacío.
- [ ] 7.2 **[RED]** Escribir `notification-list.test.tsx` — cambiar de tab cambia el filtro pasado a `useNotifications`; estado vacío visible cuando la lista está vacía.
- [ ] 7.3 **[GREEN]** Implementar `NotificationList` contra los specs.
- [ ] 7.4 Crear `presentation/components/notifications-skeleton/notifications-skeleton.tsx` — `NotificationsSkeleton`, para el `<Suspense fallback>`.
- [ ] 7.5 Crear `presentation/screens/notifications/notifications.screen.tsx` — `NotificationsScreen`, usa `ScreenHeader` + `NotificationList`.
- [ ] 7.6 **[RED]** Escribir `notifications.screen.spec.tsx`.
- [ ] 7.7 **[GREEN]** Implementar `NotificationsScreen` contra el spec.
- [ ] 7.8 Crear `app/[lang]/(protected)/notifications/page.tsx` — Server Component async, resuelve `locale`, pasa el dict slice, envuelve en `<Suspense fallback={<NotificationsSkeleton />}>`.

---

## Phase 8: Verificación final

- [ ] 8.1 `pnpm test` — todas las suites nuevas y las modificadas (`home-top-bar.spec.tsx`) en verde.
- [ ] 8.2 `pnpm lint` y `pnpm tsc --noEmit` limpios.
- [ ] 8.3 Smoke manual en navegador (si hay backend disponible con `notifications-module` desplegado): badge se actualiza, dropdown funciona, `/notifications` filtra correctamente.
