# Technical Design: notifications-web

## 0. Context & Constraints

- Stack: Next.js 16 (App Router), TypeScript strict, React 19, Apollo Client v4, TanStack Query v5, Vitest + Testing Library.
- Arquitectura: DDD + Hexagonal bajo `src/core/{context}/{layer}/`.
- Strict TDD: **true** — RED antes que GREEN en todos los archivos nuevos.
- Referencia estructural principal: `src/core/care-schedule/` — módulo de solo-lectura-con-mutaciones-simples (filtros via Criteria, sin formulario). Aquí no hay create/update, así que se omite todo lo equivalente a `use-care-schedule-form` / `CareScheduleModal`.
- Referencia de integración: `care-schedule-web` (cómo un módulo ajeno se enchufa en una pantalla existente sin acoplar capas) y `dashboard-home` (dueño de `HomeTopBar`, que ya reserva el botón de campana).
- API: `gardenia-api`, contexto `notifications` (ver el `design.md` del cambio hermano `notifications-module`). GraphQL: `notificationsFindByCriteria`, `notificationsUnreadCount`, `notificationMarkRead`, `notificationsMarkAllRead`. REST: `GET /notifications/stream` (Server-Sent Events, `@Sse()`).
- Componentes shadcn reutilizables: `numeric-badge` (contador del badge), `popover`/`dropdown-menu` (panel del bell), `tabs` (Unread/All en la pantalla completa).
- Nueva dependencia: `@microsoft/fetch-event-source` — cliente SSE basado en `fetch`, necesario porque el `EventSource` nativo del navegador no permite fijar cabeceras (`Authorization: Bearer`, `X-Space-ID`), que es como este stack autentica cada petición.
- Infraestructura ya existente y verificada por lectura de código: `app/api/[...path]/route.ts` → `proxyTo()` (`src/shared/infrastructure/http/proxy.ts`) ya reenvía `upstream.body` como `ReadableStream` (`new NextResponse(upstream.body, ...)`), sin bufferizar — el proxy same-origin ya soporta streaming sin cambios.

### ADR-001 — Sin capa de creación: `notifications` es lectura + dos mutaciones simples

A diferencia de `harvests` (CRUD completo) o `care-schedule` (CRUD completo), este módulo no crea ni edita notificaciones desde el cliente — las crea el job de reconciliación en la API. El repositorio expone `findByCriteria`, `unreadCount`, `markRead`, `markAllRead`. No hay `create-notification.use-case.ts` ni formulario.

### ADR-002 — El texto de cada notificación se construye en el cliente, no llega pre-renderizado

La API guarda `type` + `payload` (JSON estructurado, sin traducir) a propósito — así una notificación creada hoy sigue siendo legible aunque cambie el idioma de la sesión o el nombre de la planta cambie después. `buildNotificationMessage(notification, dict): string` en `presentation/utils/build-notification-message/` hace `switch (notification.type)` e interpola campos de `payload` sobre claves de `en.ts`/`es.ts`. Añadir un tipo nuevo (p. ej. `WEATHER_FROST_WARNING` en un cambio futuro) es un nuevo `case` + nuevas claves i18n, sin tocar el resto del módulo.

### ADR-003 — Filtros vía el patrón Criteria, confinados al repositorio GQL

Igual que ADR-003 de `care-schedule-web`: `NotificationFilters` (`{ status?, type? }`, camelCase) es todo lo que conocen dominio/aplicación/presentación. `NotificationGqlRepository.findByCriteria()` los traduce a `Filter<NotificationQueryableField>[]` (`NotificationQueryableField.STATUS`, `NotificationQueryableField.TYPE`, ambos `FilterOperator.EQUALS`).

### ADR-004 — Un solo componente `NotificationRow`, dos consumidores

`NotificationBell` (dropdown, máx. 5–8 recientes) y `NotificationsScreen` (lista completa paginada) renderizan la misma fila: icono por `type`, texto de `buildNotificationMessage`, hora relativa, indicador de no-leída, click → `markRead`. Vive en `presentation/components/notification-row/` y no sabe si está dentro de un dropdown o de una página — recibe `notification` + `onMarkRead` por props.

### ADR-005 — Entrega en tiempo real vía SSE, con polling solo como red de seguridad

La API ya expone `GET /notifications/stream` en v1 (ver `notifications-module`). El contador de no-leídas y la lista se mantienen frescos escribiendo directamente en la caché de TanStack Query cuando llega un evento SSE, no mediante `refetchInterval` como mecanismo principal. Un `refetchInterval` grueso (5 min, `NOTIFICATIONS_FALLBACK_POLL_INTERVAL_MS`) se mantiene en paralelo como red de seguridad — si el stream se cae en silencio (proxy que bufferiza, portátil que despierta de suspensión con un socket muerto que el navegador aún no ha detectado), el fallback recupera el estado en, como mucho, ese intervalo. Marcar como leída sigue invalidando la query al instante en la pestaña activa (`onSuccess`); el resto de pestañas del mismo usuario se enteran por SSE.

### ADR-006 — Sin entrada nueva en `NAV_ITEMS`

La campana (dropdown + "ver todas") ya es el punto de entrada, igual que en la mayoría de apps de referencia (GitHub, Slack). Añadir además una entrada de navegación duplicaría el acceso sin aportar nada, y la lista actual de `NAV_ITEMS` está reservada a dominios del huerto (plantas, calendario, cosechas...), no a utilidades transversales.

### ADR-007 — Cliente SSE autenticado vía `fetch-event-source`, no `EventSource` nativo

El `EventSource` nativo del navegador no permite fijar cabeceras HTTP personalizadas — no hay forma de mandar `Authorization: Bearer <token>` ni `X-Space-ID`, que es como el resto de la app autentica cada petición (interceptor de axios). `@microsoft/fetch-event-source` construye la conexión sobre `fetch` con streaming, así que acepta cualquier cabecera, reintenta con backoff exponencial de serie, y permite abortar la conexión (`AbortController`) para cerrarla limpiamente al desmontar o al cambiar de espacio.

### ADR-008 — Una sola conexión compartida, dueña: `NotificationsProvider`

Si `NotificationBell` y `NotificationsScreen` abrieran cada uno su propia conexión SSE, un usuario con la campana visible y la pantalla completa abierta a la vez duplicaría conexiones sin motivo. `NotificationsProvider` (montado una vez en `Providers`, patrón ya usado por `AuthProviders`) es el único sitio que llama a `fetchEventSource()`; on cada evento (`notification-created`, `notification-read`, `notification-resolved`) actualiza la caché de TanStack Query (`queryClient.setQueryData`/`invalidateQueries` sobre `['notifications-unread-count', spaceId]` y `['notifications', spaceId]`). Todo consumidor (`NotificationBell`, `NotificationsScreen`) sigue leyendo exclusivamente vía `useNotifications`/`useNotificationsUnreadCount` — no sabe que SSE existe.

### ADR-009 — Reconexión al cambiar de espacio

El servidor scopea el stream por `X-Space-ID` (la conexión abierta con un espacio activo no ve eventos de otro espacio del mismo usuario). `NotificationsProvider` observa `currentSpaceId` (Zustand) y, al cambiar, aborta la conexión anterior (`AbortController.abort()`) y abre una nueva con la cabecera actualizada — mismo patrón que cualquier hook de este stack que ya usa `spaceId` en su query key para invalidar/refrescar al cambiar de espacio.

### ADR-010 — El proxy same-origin existente ya soporta streaming, sin cambios

`app/api/[...path]/route.ts` reenvía toda petición REST a través de `proxyTo()`, que hace `return new NextResponse(upstream.body, ...)` — `upstream.body` es un `ReadableStream`, no un buffer, así que la respuesta de streaming del API ya se propaga sin bufferizar en el propio código de Next.js. `GET /api/notifications/stream` no necesita ninguna ruta especial ni excepción en el proxy. Sí es una verificación manual pendiente durante la implementación (comportamiento de streaming en el servidor Node standalone real, y de cualquier balanceador/proxy que se ponga delante en producción) — confirmado por lectura de código, no por prueba en caliente.

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
    realtime/
      notifications-sse.client.ts        # wraps fetchEventSource(); connect(spaceId, onEvent)/disconnect()
      notification-sse-event.interface.ts # NotificationSseEvent: 'notification-created' | 'notification-read' | 'notification-resolved' | 'heartbeat'
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
    providers/notifications.providers.tsx  # NotificationsProvider — owns the single SSE connection
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

## 5. Infraestructura SSE

```ts
// infrastructure/realtime/notification-sse-event.interface.ts
export type NotificationSseEventType = 'notification-created' | 'notification-read' | 'notification-resolved';
export interface NotificationSseEvent {
  type: NotificationSseEventType;
  notificationId: string;
}

// infrastructure/realtime/notifications-sse.client.ts
import { fetchEventSource } from '@microsoft/fetch-event-source';

export function connectNotificationsStream(params: {
  spaceId: string;
  getAccessToken: () => string | null; // reuses the same token accessor axios' interceptor uses
  onEvent: (event: NotificationSseEvent) => void;
  signal: AbortSignal; // caller owns the AbortController — disconnect = abort()
}): void {
  fetchEventSource('/api/notifications/stream', {
    headers: {
      Authorization: `Bearer ${params.getAccessToken() ?? ''}`,
      'X-Space-ID': params.spaceId,
    },
    signal: params.signal,
    onmessage(msg) {
      if (msg.event === 'heartbeat') return;
      params.onEvent(JSON.parse(msg.data) as NotificationSseEvent);
    },
    // fetch-event-source retries with exponential backoff by default on a
    // dropped connection; onerror can override that, left at defaults for v1
  });
}
```

Deliberately thin: no TanStack Query, no Zustand, no React here — a plain
function taking primitives + callbacks, so `use-notifications.hook.spec.ts`equivalents can test the *provider* by mocking this module, not by mocking
`fetch` directly.

## 6. Hooks de presentación

```ts
// use-notifications-unread-count.hook.ts
// Value now comes from the TanStack Query cache, kept fresh by NotificationsProvider's
// SSE event handler (setQueryData) — this hook itself doesn't know SSE exists.
const FALLBACK_POLL_INTERVAL_MS = 5 * 60_000;

export function useNotificationsUnreadCount() {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const { data } = useQuery({
    queryKey: ['notifications-unread-count', spaceId],
    queryFn: () => getUnreadCountUseCase.execute(),
    enabled: !!spaceId,
    refetchInterval: FALLBACK_POLL_INTERVAL_MS, // safety net only — SSE is the primary freshness path
  });
  return { unreadCount: data ?? 0 };
}
```

```tsx
// presentation/providers/notifications.providers.tsx (fragmento representativo)
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!spaceId) return;
    const controller = new AbortController();
    connectNotificationsStream({
      spaceId,
      getAccessToken: () => useAuthStore.getState().accessToken,
      signal: controller.signal,
      onEvent: () => {
        // v1: any event just invalidates — simplest correct behavior; a future
        // optimization could patch the cache in place per event type instead.
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', spaceId] });
        queryClient.invalidateQueries({ queryKey: ['notifications', spaceId] });
      },
    });
    return () => controller.abort();
  }, [spaceId, queryClient]);

  return <>{children}</>;
}
```

`useMarkNotificationRead`/`useMarkAllNotificationsRead` still invalidate both
`['notifications', spaceId]` and `['notifications-unread-count', spaceId]`
in their own `onSuccess` too — the active tab doesn't wait for its own SSE
echo to update, it invalidates immediately like every other mutation in this
codebase; SSE is what keeps *other* tabs/devices in sync.

## 7. `Providers` wiring and `HomeTopBar` integration

`NotificationsProvider` is registered in
`src/shared/presentation/providers/providers.tsx`, inside `AuthProviders`
(it needs an authenticated user before it makes sense to open a stream) and
above everything else, same pattern as every other module's
`{context}.providers.tsx`. It renders nothing itself — pure side-effect
component, mounted once for the whole authenticated app, not per-screen.

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

## 8. Testing Strategy

| Capa | Qué | Enfoque |
|------|-----|---------|
| Application | 4 use-cases delegan al puerto con los argumentos correctos | Vitest, mock de `INotificationRepository` |
| Infrastructure (GraphQL) | `NotificationGqlRepository`: `findByCriteria()` sin filtros / con `status` / con `type`; `unreadCount()`; `markRead()` variables `{ id }` sin invalidar caché de Apollo (TanStack Query gestiona la invalidación); `markAllRead()` sin variables | Vitest, `vi.mock('@/shared/infrastructure/http/apollo.client')`, mismo patrón que `care-schedule.gql.repository.spec.ts` |
| Infrastructure (SSE) | `connectNotificationsStream`: llama a `fetchEventSource` con la URL, cabeceras (`Authorization`, `X-Space-ID`) y `signal` correctos; `onmessage` ignora `event: 'heartbeat'`; `onmessage` parsea y reenvía cualquier otro evento a `onEvent` | Vitest, `vi.mock('@microsoft/fetch-event-source')` |
| Presentation (hooks) | `useNotifications` respeta `enabled: !!spaceId`; `useNotificationsUnreadCount` configura `refetchInterval: FALLBACK_POLL_INTERVAL_MS` (el valor grande de red de seguridad, no un intervalo corto); mutaciones invalidan ambas query keys | Vitest, mock de use-cases |
| Presentation (provider) | `NotificationsProvider`: no conecta si `spaceId` es `null`; conecta al montar con `spaceId` presente; un evento recibido invalida `['notifications', spaceId]` y `['notifications-unread-count', spaceId]`; cambiar `spaceId` aborta la conexión anterior y abre una nueva con el `spaceId` nuevo; desmontar aborta la conexión | React Testing Library, `vi.mock('@/core/notifications/infrastructure/realtime/notifications-sse.client')` |
| Presentation (componentes) | `NotificationBell`: badge oculto si `unreadCount === 0`, visible con el número si `> 0`; abrir dropdown dispara la query de recientes; click en fila llama `markRead`; "marcar todas" llama `markAllRead`. `NotificationRow`: `buildNotificationMessage` produce el texto esperado para cada `type` con un `payload` de ejemplo, y un texto genérico de fallback si falta un campo esperado. `NotificationsScreen`: tabs Unread/All cambian el filtro pasado al hook | React Testing Library |
| i18n | `i18n-parity.test.ts` — mismas claves en `en`/`es` | Vitest |

Nota sobre `fetch-event-source` en tests: se mockea siempre a nivel de
módulo (`vi.mock`) — ningún test de este cambio abre una conexión HTTP real
ni depende de que el backend esté corriendo, ni siquiera los de
`NotificationsProvider`.

## 9. Open Questions

- Si el cambio de la API (`notifications-module`) todavía no está desplegado
  cuando esto se implemente, el desarrollo puede avanzar contra un mock del
  esquema GraphQL/SSE (mismo patrón que otros módulos han usado mientras su
  contraparte de API estaba en curso) — confirmar con el equipo si se
  necesita un stub explícito o si se espera al deploy real.
- Verificación manual pendiente en implementación (no se puede confirmar solo
  leyendo código): que el servidor Node standalone (`node server.js`, sin
  `next start`) efectivamente transmite la respuesta SSE sin bufferizar de
  extremo a extremo, y que ningún proxy/balanceador de producción bufferiza
  `text/event-stream` — ver el riesgo correspondiente en `proposal.md`.
