# Technical Design: care-log-web

## 0. Context & Constraints

- Stack: Next.js 16 (App Router), TypeScript strict, React 19, Apollo Client v4, TanStack Query v5, Vitest + Testing Library.
- Architecture: DDD + Hexagonal bajo `src/core/{context}/{layer}/`.
- Strict TDD: **true** — tests escritos antes que la implementación.
- Referencia: `src/core/plants/` — patrón a seguir exactamente.
- Tiempo relativo: `Intl.RelativeTimeFormat` nativo (sin dependencias externas).

### ADR-001 — `care-log` es un bounded context propio
`CareLogEntry` no es una extensión del dominio `plants`. En la API tienen contextos separados. La web sigue la misma separación: `src/core/care-log/` es independiente de `src/core/plants/`. El componente `CareLogSummary` se importa en `plant-detail.screen.tsx` cruzando contextos solo en la capa de presentación (aceptable).

### ADR-002 — `spaceId` en el query key, no en la firma del use-case
Igual que en `plants-module` (ADR-001 allí): el repositorio GQL no recibe `spaceId`. Apollo Client inyecta `X-Space-ID` automáticamente vía el link de autenticación. `spaceId` solo entra como parte de la React Query key para invalidar caché al cambiar de espacio.

### ADR-003 — `findByPlantId(plantId, limit)` con limit=50
Pedimos los últimos 50 registros (ordenados desc por `performedAt`) y reducimos en memoria al último por tipo. 50 cubre todos los tipos de actividad (9 tipos × varias entradas cada uno) sin paginar. Si la planta tiene menos de 50 registros, no hay problema.

### ADR-004 — Tiempo relativo con `Intl.RelativeTimeFormat`
Calculamos la diferencia entre `performedAt` y `Date.now()` en segundos/minutos/horas/días/semanas y usamos `Intl.RelativeTimeFormat(locale, { numeric: 'auto' })` para obtener "hace 3 días", "ayer", etc. Sin librerías.

---

## 1. Module Structure

```
src/core/care-log/
  domain/
    interfaces/
      care-log-entry.interface.ts       # CareLogEntry, CareLogActivityType, LastCareByType
  application/
    ports/
      care-log.repository.port.ts       # ICareLogRepository
    use-cases/
      get-plant-care-logs/
        get-plant-care-logs.use-case.ts
        get-plant-care-logs.use-case.spec.ts
  infrastructure/
    repositories/
      graphql/
        queries/
          care-log-find-by-plant.query.ts  # gql document
        responses/
          care-log-find-by-plant.response.ts  # TS type para la respuesta GQL
        care-log.gql.repository.ts
        care-log.gql.repository.spec.ts
  presentation/
    hooks/
      use-plant-care-logs/
        use-plant-care-logs.hook.ts
        use-plant-care-logs.hook.spec.ts
    components/
      care-log-summary/
        care-log-summary.tsx
        care-log-summary.test.tsx
    i18n/
      en.ts
      es.ts
      i18n-parity.test.ts
```

Touch-points en módulos existentes:
```
src/core/plants/presentation/screens/plant-detail/plant-detail.screen.tsx  # añadir CareLogSummary
src/core/plants/presentation/i18n/en.ts   # añadir careLog section
src/core/plants/presentation/i18n/es.ts   # ídem en español
src/shared/presentation/i18n/get-dictionary.ts  # registrar CareLogDict en AppDict
```

---

## 2. Domain Layer

### `domain/interfaces/care-log-entry.interface.ts`

```ts
export enum CareLogActivityType {
  WATERING = 'WATERING',
  FERTILIZING = 'FERTILIZING',
  PRUNING = 'PRUNING',
  REPOTTING = 'REPOTTING',
  TRANSPLANTING = 'TRANSPLANTING',
  PEST_TREATMENT = 'PEST_TREATMENT',
  MISTING = 'MISTING',
  ROTATION = 'ROTATION',
  OTHER = 'OTHER',
}

export interface CareLogEntry {
  id: string;
  plantId: string;
  userId: string;
  spaceId: string;
  activityType: CareLogActivityType;
  performedAt: string;  // ISO string
  notes: string | null;
  quantity: number | null;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Mapa de activityType → entrada más reciente */
export type LastCareByType = Partial<Record<CareLogActivityType, CareLogEntry>>;
```

`performedAt` se almacena como ISO string para evitar hidratación errónea de `Date` entre servidor y cliente.

---

## 3. Application Layer

### Port — `application/ports/care-log.repository.port.ts`

```ts
import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

export interface ICareLogRepository {
  findByPlantId(plantId: string, limit?: number): Promise<CareLogEntry[]>;
}
```

### Use-case — `get-plant-care-logs/get-plant-care-logs.use-case.ts`

```ts
import type { ICareLogRepository } from '@/core/care-log/application/ports/care-log.repository.port';
import type { CareLogEntry, LastCareByType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

export class GetPlantCareLogsUseCase {
  constructor(private readonly careLogRepository: ICareLogRepository) {}

  async execute(plantId: string): Promise<LastCareByType> {
    const entries = await this.careLogRepository.findByPlantId(plantId, 50);
    return this.reduceToLastByType(entries);
  }

  private reduceToLastByType(entries: CareLogEntry[]): LastCareByType {
    // entries ya vienen ordenadas desc por performedAt desde la API
    const result: LastCareByType = {};
    for (const entry of entries) {
      if (!(entry.activityType in result)) {
        result[entry.activityType] = entry;
      }
    }
    return result;
  }
}
```

### Tests — `get-plant-care-logs.use-case.spec.ts`

- Mock `ICareLogRepository` con `vi.fn()`.
- "returns last entry per activity type when multiple entries exist" → dado varios entries del mismo tipo, el resultado tiene uno por tipo (el primero = el más reciente).
- "returns empty object when no entries" → `findByPlantId` resuelve `[]`, resultado es `{}`.
- "propagates repository errors" → `findByPlantId` rechaza, `execute` rechaza con el mismo error.

---

## 4. Infrastructure Layer

### `queries/care-log-find-by-plant.query.ts`

```ts
import { gql } from '@apollo/client';

export const CARE_LOG_FIND_BY_PLANT = gql`
  query CareLogFindByPlant($input: CareLogFindByCriteriaGraphQLDto!) {
    careLogFindByCriteria(input: $input) {
      items {
        id
        plantId
        userId
        spaceId
        activityType
        performedAt
        notes
        quantity
        unit
        createdAt
        updatedAt
      }
      total
      page
      perPage
      totalPages
    }
  }
`;
```

### `responses/care-log-find-by-plant.response.ts`

```ts
import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

export interface CareLogFindByPlantResponse {
  careLogFindByCriteria: {
    items: CareLogEntry[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
```

### `care-log.gql.repository.ts`

```ts
import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { ICareLogRepository } from '@/core/care-log/application/ports/care-log.repository.port';
import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import { CARE_LOG_FIND_BY_PLANT } from './queries/care-log-find-by-plant.query';
import type { CareLogFindByPlantResponse } from './responses/care-log-find-by-plant.response';

export class CareLogGqlRepository implements ICareLogRepository {
  async findByPlantId(plantId: string, limit = 50): Promise<CareLogEntry[]> {
    const res = await apolloClient.query<CareLogFindByPlantResponse>({
      query: CARE_LOG_FIND_BY_PLANT,
      variables: {
        input: {
          plantId,
          page: 1,
          limit,
        },
      },
    });
    return res.data?.careLogFindByCriteria?.items ?? [];
  }
}

export const careLogGqlRepository = new CareLogGqlRepository();
```

### Repository test — `care-log.gql.repository.spec.ts`

- `vi.mock('@/shared/infrastructure/http/apollo.client', () => ({ apolloClient: { query: vi.fn() } }))`.
- "findByPlantId() llama a careLogFindByCriteria con el plantId correcto" → assert variables `{ input: { plantId: 'p-1', page: 1, limit: 50 } }`.
- "retorna los items de la respuesta" → `apolloClient.query` resuelve con mock data, assert devuelve `items`.
- "retorna array vacío si no hay items" → `careLogFindByCriteria: null`, assert devuelve `[]`.

---

## 5. Presentation Layer — Hook

### `use-plant-care-logs/use-plant-care-logs.hook.ts`

```ts
import { useQuery } from '@tanstack/react-query';
import { GetPlantCareLogsUseCase } from '@/core/care-log/application/use-cases/get-plant-care-logs/get-plant-care-logs.use-case';
import { careLogGqlRepository } from '@/core/care-log/infrastructure/repositories/graphql/care-log.gql.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const getPlantCareLogsUseCase = new GetPlantCareLogsUseCase(careLogGqlRepository);

export function usePlantCareLogs(plantId: string) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  return useQuery({
    queryKey: ['care-log', spaceId, plantId],
    queryFn: () => getPlantCareLogsUseCase.execute(plantId),
    enabled: !!spaceId && !!plantId,
  });
}
```

### Hook test — `use-plant-care-logs.hook.spec.ts`

- `renderHook` con `QueryClientProvider` (retries: 0).
- Mock `GetPlantCareLogsUseCase` y `useSpacesStore`.
- "retorna LastCareByType en éxito" → use-case resuelve mock data, hook alcanza `isSuccess`.
- "permanece idle cuando spaceId es null" → `currentSpaceId: null`, assert `fetchStatus === 'idle'`.
- "permanece idle cuando plantId está vacío" → `plantId: ''`, assert `fetchStatus === 'idle'`.

---

## 6. Presentation Layer — Component

### `care-log-summary/care-log-summary.tsx`

Props:
```ts
type Props = {
  lastCareByType: LastCareByType;
  dict: AppDict['careLog'];
  lang: string;
};
```

Lógica:
- Ordena los tipos presentes en `lastCareByType` por `performedAt` desc.
- Para cada entrada renderiza una fila: icono + nombre del tipo + tiempo relativo.
- Si `lastCareByType` está vacío, muestra `dict.empty`.

Tiempo relativo — función pura `formatRelativeTime(isoDate: string, locale: string): string`:
```ts
function formatRelativeTime(isoDate: string, locale: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  const diffSecs = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diffSecs);
  if (abs < 60) return rtf.format(diffSecs, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSecs / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSecs / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.round(diffSecs / 86400), 'day');
  return rtf.format(Math.round(diffSecs / 604800), 'week');
}
```

Icono por tipo (lucide-react):
- WATERING → `Droplets`
- FERTILIZING → `Sprout`
- PRUNING → `Scissors`
- REPOTTING → `Shovel`
- TRANSPLANTING → `ArrowRightLeft`
- PEST_TREATMENT → `Bug`
- MISTING → `CloudRain`
- ROTATION → `RotateCw`
- OTHER → `MoreHorizontal`

UI visual:
```tsx
<div className="flex flex-col gap-2">
  <p className="eyebrow mb-1">{dict.sectionTitle}</p>
  {entries.length === 0 ? (
    <p className="text-sm text-muted-foreground">{dict.empty}</p>
  ) : (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
      {entries.map(({ type, entry }) => (
        <div key={type} className="flex items-center gap-3 px-4 py-3 bg-card">
          <span className="text-[var(--forest)]">{iconFor(type)}</span>
          <span className="text-sm font-medium flex-1">{dict.activityTypes[type]}</span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(entry.performedAt, lang)}
          </span>
        </div>
      ))}
    </div>
  )}
</div>
```

### Component tests — `care-log-summary.test.tsx`

- "muestra sectionTitle del dict".
- "muestra el nombre localizado de la actividad para cada tipo presente".
- "muestra el estado vacío cuando lastCareByType está vacío".
- "no renderiza entradas para tipos ausentes en el mapa".
- "muestra el tiempo relativo formateado" (mock `Date.now()` o pasar ISO date conocida).

---

## 7. i18n

### `care-log/presentation/i18n/en.ts`

```ts
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

const dict = {
  sectionTitle: 'Last care',
  empty: 'No care activities logged yet.',
  activityTypes: {
    [CareLogActivityType.WATERING]: 'Watering',
    [CareLogActivityType.FERTILIZING]: 'Fertilizing',
    [CareLogActivityType.PRUNING]: 'Pruning',
    [CareLogActivityType.REPOTTING]: 'Repotting',
    [CareLogActivityType.TRANSPLANTING]: 'Transplanting',
    [CareLogActivityType.PEST_TREATMENT]: 'Pest treatment',
    [CareLogActivityType.MISTING]: 'Misting',
    [CareLogActivityType.ROTATION]: 'Rotation',
    [CareLogActivityType.OTHER]: 'Other',
  },
} as const;

export default dict;
export type CareLogDict = typeof dict;
```

### `care-log/presentation/i18n/es.ts`

```ts
import type { CareLogDict } from './en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

const dict = {
  sectionTitle: 'Últimos cuidados',
  empty: 'Todavía no hay actividades registradas.',
  activityTypes: {
    [CareLogActivityType.WATERING]: 'Riego',
    [CareLogActivityType.FERTILIZING]: 'Fertilización',
    [CareLogActivityType.PRUNING]: 'Poda',
    [CareLogActivityType.REPOTTING]: 'Trasplante de maceta',
    [CareLogActivityType.TRANSPLANTING]: 'Trasplante',
    [CareLogActivityType.PEST_TREATMENT]: 'Tratamiento de plagas',
    [CareLogActivityType.MISTING]: 'Pulverización',
    [CareLogActivityType.ROTATION]: 'Rotación',
    [CareLogActivityType.OTHER]: 'Otro',
  },
} as const satisfies WidenStringLiterals<CareLogDict>;

export default dict;
```

### Registro en `AppDict` — `get-dictionary.ts`

```ts
import type { CareLogDict } from '@/core/care-log/presentation/i18n/en';
import enCareLog from '@/core/care-log/presentation/i18n/en';
import esCareLog from '@/core/care-log/presentation/i18n/es';
// AppDict += careLog: WidenStringLiterals<CareLogDict>;
// dictionaries.en.careLog = enCareLog; dictionaries.es.careLog = esCareLog;
```

---

## 8. Integration in `plant-detail.screen.tsx`

Se añade `usePlantCareLogs(plantId)` y se renderiza `<CareLogSummary>` en la pestaña "care", encima del grid de `CareCard`. Cambios mínimos:

```diff
+ import { CareLogSummary } from '@/core/care-log/presentation/components/care-log-summary/care-log-summary';
+ import { usePlantCareLogs } from '@/core/care-log/presentation/hooks/use-plant-care-logs/use-plant-care-logs.hook';

  export function PlantDetailScreen({ dict, lang, spaceId: spaceIdProp, plantId }: Props) {
    ...
+   const { data: lastCareByType = {} } = usePlantCareLogs(plantId);
    ...
    <TabsContent value="care">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
+         <CareLogSummary lastCareByType={lastCareByType} dict={dict.careLog} lang={lang} />
          <div data-testid="care-grid" ...>
```

El campo `dict.careLog` viene del `AppDict` actualizado (pasado desde el Server Component `page.tsx` que ya pasa `dict.plants` completo).

**Nota**: el Server Component `page.tsx` ya pasa `dict={dict.plants}` al screen. Añadir `careLog` en `AppDict` extiende ese dict. Habrá que actualizar los tipos de `Props` del screen para incluir `dict.careLog: AppDict['careLog']` o pasar el `dict` completo. Se elige la segunda opción (ya recibe `AppDict['plants']`) añadiendo `careLogDict: AppDict['careLog']` como prop separada para mantener el acoplamiento mínimo.

---

## 9. Data Flow

```
Server Component page.tsx
  │ dict.plants, dict.careLog, lang, plantId
  ▼
PlantDetailScreen ('use client')
  ├── usePlant(spaceId, plantId)       → Plant data
  └── usePlantCareLogs(plantId)        → LastCareByType
        │ enabled: !!spaceId && !!plantId
        ▼
  GetPlantCareLogsUseCase.execute(plantId)
        ▼
  CareLogGqlRepository.findByPlantId(plantId, 50)
        ▼
  apolloClient.query(CARE_LOG_FIND_BY_PLANT)
  ← X-Space-ID inyectado por Apollo link
        ▼
  gardenia-api  careLogFindByCriteria({ plantId, page: 1, limit: 50 })
        ▼
  reduceToLastByType(entries) → LastCareByType
        ▼
  <CareLogSummary lastCareByType={...} dict={careLogDict} lang={lang} />
```

---

## 10. Test Strategy

| Capa | Archivo | Enfoque |
|------|---------|---------|
| Use-case | `get-plant-care-logs.use-case.spec.ts` | Mock `ICareLogRepository`. Assert reducción a último por tipo, caso vacío, propagación de errores. |
| Repository | `care-log.gql.repository.spec.ts` | `vi.mock` `apolloClient`. Assert query variables y mapeo de respuesta. |
| Hook | `use-plant-care-logs.hook.spec.ts` | `renderHook` + `QueryClientProvider`. Mock use-case + `useSpacesStore`. Assert success + gating `enabled`. |
| Componente | `care-log-summary.test.tsx` | `render`. Pasar `lastCareByType` mock. Assert filas, nombres localizados, estado vacío. |
| i18n parity | `i18n-parity.test.ts` | Flatten en/es. Assert diferencia simétrica vacía. |

---

## 11. Open Questions

1. **`performedAt` ordenado en la API**: se asume que `careLogFindByCriteria` con `limit=50` devuelve entradas ordenadas desc por `performedAt`. Si no, el use-case ordena antes de reducir.
2. **Props del screen**: si `PlantDetailScreen` ya recibe `dict: AppDict['plants']` y el Server Component pasa `dict={dict.plants}`, necesitamos pasar `careLogDict={dict.careLog}` como prop adicional o reestructurar el dictado. El diseño elige prop adicional para no romper nada existente.
