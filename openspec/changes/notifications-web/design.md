# Technical Design: notifications-web

## 0. Context & Constraints

- Stack: Next.js 16 (App Router), TypeScript strict, React 19, Apollo Client v4, TanStack Query v5, Vitest + Testing Library.
- Arquitectura: DDD + Hexagonal bajo `src/core/{context}/{layer}/`.
- Strict TDD: **true** — RED antes que GREEN en todos los archivos nuevos.
- Referencia estructural principal: `src/core/care-schedule/` — módulo de solo-lectura-con-mutaciones-simples (filtros via Criteria, sin formulario). Aquí no hay create/update, así que se omite todo lo equivalente a `use-care-schedule-form` / `CareScheduleModal`.
- Referencia de integración: `care-schedule-web` (cómo un módulo ajeno se enchufa en una pantalla existente sin acoplar capas) y `dashboard-home` (dueño de `HomeTopBar`, que ya reserva el botón de campana).
- API: `gardenia-api`, contexto `notifications` (ver el `design.md` del cambio hermano `notifications-module`). GraphQL: `notificationsFindByCriteria`, `notificationsUnreadCount`, `notificationMarkRead`, `notificationsMarkAllRead`.
- Componentes shadcn reutilizables: `numeric-badge` (contador del badge), `popover`/`dropdown-menu` (panel del bell), `tabs` (Unread/All en la pantalla completa).

### ADR-001 — Sin capa de creación: `notifications` es lectura + dos mutaciones simples

A diferencia de `harvests` (CRUD completo) o `care-schedule` (CRUD completo), este módulo no crea ni edita notificaciones desde el cliente — las crea el job de reconciliación en la API. El repositorio expone `findByCriteria`, `unreadCount`, `markRead`, `markAllRead`. No hay `create-notification.use-case.ts` ni formulario.

### ADR-002 — El texto de cada notificación se construye en el cliente, no llega pre-renderizado

La API guarda `type` + `payload` (JSON estructurado, sin traducir) a propósito — así una notificación creada hoy sigue siendo legible aunque cambie el idioma de la sesión o el nombre de la planta cambie después. `buildNotificationMessage(notification, dict): string` en `presentation/utils/build-notification-message/` hace `switch (notification.type)` e interpola campos de `payload` sobre claves de `en.ts`/`es.ts`. Añadir un tipo nuevo (p. ej. `WEATHER_FROST_WARNING` en un cambio futuro) es un nuevo `case` + nuevas claves i18n, sin tocar el resto del módulo.

### ADR-003 — Filtros vía el patrón Criteria, confinados al repositorio GQL

Igual que ADR-003 de `care-schedule-web`: `NotificationFilters` (`{ status?, type? }`, camelCase) es todo lo que conocen dominio/aplicación/presentación. `NotificationGqlRepository.findByCriteria()` los traduce a `Filter<NotificationQueryableField>[]` (`NotificationQueryableField.STATUS`, `NotificationQueryableField.TYPE`, ambos `FilterOperator.EQUALS`).

### ADR-004 — Un solo componente `NotificationRow`, dos consumidores

`NotificationBell` (dropdown, máx. 5–8 recientes) y `NotificationsScreen` (lista completa paginada) renderizan la misma fila: icono por `type`, texto de `buildNotificationMessage`, hora relativa, indicador de no-leída, click → `markRead`. Vive en `presentation/components/notification-row/` y no sabe si está dentro de un dropdown o de una página — recibe `notification` + `onMarkRead` por props.

### ADR-005 — Polling del contador, no invalidación reactiva

No existe WebSocket/SSE en ningún lado del stack todavía, y la propia API genera notificaciones vía un job de reconciliación cada 15 min (v1), no en tiempo real. `useNotificationsUnreadCount` usa `refetchInterval: 60_000` (constante exportada, fácil de ajustar) en vez de intentar simular tiempo real con una infraestructura que no existe. Marcar como leída sigue invalidando la query al instante (`onSuccess`), así que la UI del usuario activo se siente inmediata; el polling solo cubre "algo nuevo llegó mientras no interactuabas".

### ADR-006 — Sin entrada nueva en `NAV_ITEMS`

La campana (dropdown + "ver todas") ya es el punto de entrada, igual que en la mayoría de apps de referencia (GitHub, Slack). Añadir además una entrada de navegación duplicaría el acceso sin aportar nada, y la lista actual de `NAV_ITEMS` está reservada a dominios del huerto (plantas, calendario, cosechas...), no a utilidades transversales.

---

## 1. Estructura del módulo

```
src/core/notifications/
  domain/
    types/notification.interface.ts          # NOTIFICATION_TYPES, NotificationType, NOTIFICATION_STATUSES, NotificationStatus, Notification
    enums/notification-queryable-field.enum.ts # NotificationQueryableField: TYPE = 'type', STATUS = 'status'
  application/
    interfaces/notification-filters.interface.ts  # { status?: NotificationStatus; type?: NotificationType }
    ports/notification.repository.port.ts          # INotificationRepository
    use-cases/
      get-notifications/get-notifications.use-case.ts
      get-notifications-unread-count/get-notifications-unread-count.use-case.ts
      mark-notification-read/mark-notification-read.use-case.ts
      mark-all-notifications-read/mark-all-notifications-read.use-case.ts
  infrastructure/
    repositories/graphql/
      notification.gql.repository.ts
      queries/notifications-find-by-criteria.query.ts
      queries/notifications-unread-count.query.ts
      mutations/notification-mark-read.mutation.ts
      mutations/notifications-mark-all-read.mutation.ts
      responses/notifications-find-by-criteria.response.ts
      responses/notifications-unread-count.response.ts
      responses/notification-mark-read.response.ts
      responses/notifications-mark-all-read.response.ts
  presentation/
    hooks/
      use-notifications/use-notifications.hook.ts
      use-notifications-unread-count/use-notifications-unread-count.hook.ts
      use-mark-notification-read/use-mark-notification-read.hook.ts
      use-mark-all-notifications-read/use-mark-all-notifications-read.hook.ts
    components/
      notification-bell/notification-bell.tsx
      notification-row/notification-row.tsx
      notification-list/notification-list.tsx
    screens/notifications/notifications.screen.tsx
    utils/build-notification-message/build-notification-message.util.ts
    i18n/en.ts
    i18n/es.ts
    i18n/i18n-parity.test.ts

app/[lang]/(protected)/notifications/
  page.tsx
  (skeleton reused from a shared presentation/components/notifications-skeleton/ in the module, per naming convention)
```

## 2. Dominio

```ts
// domain/types/notification.interface.ts
export const NOTIFICATION_TYPES = [
  'CARE_SCHEDULE_DUE',
  'INVENTORY_LOW_STOCK',
  'INVENTORY_EXPIRING_SOON',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_STATUSES = ['UNREAD', 'READ'] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export interface Notification {
  id: string;
  type: NotificationType;
  referenceType: 'CARE_SCHEDULE' | 'INVENTORY_ITEM';
  referenceId: string;
  payload: Record<string, unknown>;
  status: NotificationStatus;
  readAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
}
```

## 3. Aplicación

```ts
// application/interfaces/notification-filters.interface.ts
export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

// application/ports/notification.repository.port.ts
export interface INotificationRepository {
  findByCriteria(filters?: NotificationFilters): Promise<Notification[]>;
  unreadCount(): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}
```

Cuatro use-cases, cada uno una delegación de una línea al repositorio (mismo
patrón que `GetCareSchedulesUseCase`) — el valor de la capa no es lógica de
negocio (no la hay: es un espejo de lectura) sino mantener el límite
hexagonal para que los hooks nunca importen el repositorio GQL directamente.

## 4. Infraestructura GraphQL

```ts
// notification.gql.repository.ts (fragmento representativo)
function toApiFilters(filters?: NotificationFilters): Filter<NotificationQueryableField>[] | undefined {
  if (!filters) return undefined;
  const apiFilters: Filter<NotificationQueryableField>[] = [];
  if (filters.status) {
    apiFilters.push({ field: NotificationQueryableField.STATUS, operator: FilterOperator.EQUALS, value: filters.status });
  }
  if (filters.type) {
    apiFilters.push({ field: NotificationQueryableField.TYPE, operator: FilterOperator.EQUALS, value: filters.type });
  }
  return apiFilters.length > 0 ? apiFilters : undefined;
}
```

`markRead`/`markAllRead` return `void` (fire-and-forget acks, per the API's
`{ id, success, message }` shape) — no `getById` re-fetch, consistent with
the repo-wide rule against refetching just to satisfy an unused return type.

## 5. Hooks de presentación

```ts
// use-notifications-unread-count.hook.ts
const UNREAD_COUNT_POLL_INTERVAL_MS = 60_000;

export function useNotificationsUnreadCount() {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const { data } = useQuery({
    queryKey: ['notifications-unread-count', spaceId],
    queryFn: () => getUnreadCountUseCase.execute(),
    enabled: !!spaceId,
    refetchInterval: UNREAD_COUNT_POLL_INTERVAL_MS,
  });
  return { unreadCount: data ?? 0 };
}
```

`useMarkNotificationRead`/`useMarkAllNotificationsRead` invalidate both
`['notifications', spaceId]` and `['notifications-unread-count', spaceId]`
on success — a single mutation affects both the list and the badge.

## 6. `HomeTopBar` integration

`home-top-bar.tsx:51-53` currently renders:

```tsx
<Button variant="ghost" size="sm" aria-label={dict.topbar.notifications} className="p-2">
  <Bell size={18} />
</Button>
```

This is replaced with:

```tsx
<NotificationBell ariaLabel={dict.topbar.notifications} dict={notificationsDict} />
```

`NotificationBell` owns its own `Popover`/`DropdownMenu` state, the
`NumericBadge` overlay (rendered only when `unreadCount > 0`), the recent-list
query (`useNotifications({ limit: 6 })`... actually `useNotifications`
without a hard "recent" filter — the dropdown just slices `.slice(0, 6)`
client-side to avoid a second query shape for what's otherwise the same
list), and a "ver todas" link to `/${locale}/notifications`. `HomeTopBar`
passes only `ariaLabel` and the `notifications` i18n dict slice through — it
does not know about unread counts, GraphQL, or TanStack Query, preserving
the existing rule that `home` never reaches into another module's
application/infrastructure layers.

## 7. Testing Strategy

| Capa | Qué | Enfoque |
|------|-----|---------|
| Application | 4 use-cases delegan al puerto con los argumentos correctos | Vitest, mock de `INotificationRepository` |
| Infrastructure | `NotificationGqlRepository`: `findByCriteria()` sin filtros / con `status` / con `type`; `unreadCount()`; `markRead()` variables `{ id }` sin invalidar caché de Apollo (TanStack Query gestiona la invalidación); `markAllRead()` sin variables | Vitest, `vi.mock('@/shared/infrastructure/http/apollo.client')`, mismo patrón que `care-schedule.gql.repository.spec.ts` |
| Presentation (hooks) | `useNotifications` respeta `enabled: !!spaceId`; `useNotificationsUnreadCount` configura `refetchInterval`; mutaciones invalidan ambas query keys | Vitest, mock de use-cases |
| Presentation (componentes) | `NotificationBell`: badge oculto si `unreadCount === 0`, visible con el número si `> 0`; abrir dropdown dispara la query de recientes; click en fila llama `markRead`; "marcar todas" llama `markAllRead`. `NotificationRow`: `buildNotificationMessage` produce el texto esperado para cada `type` con un `payload` de ejemplo, y un texto genérico de fallback si falta un campo esperado. `NotificationsScreen`: tabs Unread/All cambian el filtro pasado al hook | React Testing Library |
| i18n | `i18n-parity.test.ts` — mismas claves en `en`/`es` | Vitest |

## 8. Open Questions

- Si el cambio de la API (`notifications-module`) todavía no está desplegado
  cuando esto se implemente, el desarrollo puede avanzar contra un mock del
  esquema GraphQL (mismo patrón que otros módulos han usado mientras su
  contraparte de API estaba en curso) — confirmar con el equipo si se
  necesita un stub explícito o si se espera al deploy real.
