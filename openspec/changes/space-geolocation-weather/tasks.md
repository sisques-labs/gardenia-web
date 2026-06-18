# Tasks: Space Geolocation & Weather

## Review Workload Forecast

| Phase | Files touched | Estimated diff size | Review complexity |
|-------|---------------|---------------------|-------------------|
| 1 — Domain types & interfaces | 4 | ~60 lines | Low |
| 2 — Application interfaces & port | 2 | ~30 lines | Low |
| 3 — Infrastructure (GQL + repository) | 3 | ~60 lines | Medium |
| 4 — Use cases | 2 | ~30 lines | Low |
| 5 — Presentation (hook + widget) | 2 | ~120 lines | Medium |
| 6 — i18n updates | 2 | ~40 lines | Low |
| **Total** | **15** | **~340 lines** | **Medium** |

---

## Phase 1 — Domain types and interfaces

- [ ] **1.1** Create `src/core/spaces/domain/types/space-environment.type.ts`
  - Export `SpaceEnvironment = 'INDOOR' | 'OUTDOOR' | 'MIXED'`

- [ ] **1.2** Update `src/core/spaces/domain/interfaces/space.interface.ts`
  - Import `SpaceEnvironment` type
  - Add `latitude?: number | null`, `longitude?: number | null`, `environment?: SpaceEnvironment | null`

- [ ] **1.3** Update `src/core/spaces/domain/interfaces/space-detail.interface.ts`
  - Same three optional geolocation fields as above

- [ ] **1.4** Create `src/core/spaces/domain/interfaces/space-weather.interface.ts`
  - Export `DailyForecast` interface (date, temperatureMin, temperatureMax, precipitationSum, weatherCode)
  - Export `SpaceWeather` interface (latitude, longitude, timezone, daily: DailyForecast[])

---

## Phase 2 — Application interfaces and port

- [ ] **2.1** Create `src/core/spaces/application/interfaces/update-geolocation-input.interface.ts`
  - Export `UpdateGeolocationInput` with `spaceId: string`, optional lat/lon/environment

- [ ] **2.2** Update `src/core/spaces/application/ports/spaces.repository.port.ts`
  - Import `SpaceWeather` from domain interfaces
  - Import `UpdateGeolocationInput` from application interfaces
  - Add `getSpaceWeather(spaceId: string): Promise<SpaceWeather | null>` to `ISpacesRepository`
  - Add `updateGeolocation(input: UpdateGeolocationInput): Promise<void>` to `ISpacesRepository`

---

## Phase 3 — Infrastructure (GQL documents + repository methods)

- [ ] **3.1** Create `src/core/spaces/infrastructure/repositories/graphql/queries/space-weather.query.ts`
  - Export `SPACE_WEATHER` GQL document with `SpaceWeather` selection set

- [ ] **3.2** Create `src/core/spaces/infrastructure/repositories/graphql/mutations/space-update-geolocation.mutation.ts`
  - Export `SPACE_UPDATE_GEOLOCATION` GQL document with `{ id, success, message }` envelope

- [ ] **3.3** Update `src/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository.ts`
  - Import `SpaceWeather`, `UpdateGeolocationInput`, `SPACE_WEATHER`, `SPACE_UPDATE_GEOLOCATION`
  - Implement `getSpaceWeather(spaceId)` using `apolloClient.query` with `fetchPolicy: 'network-only'`
  - Implement `updateGeolocation(input)` using `apolloClient.mutate`; throw on `success === false`
  - Add `SpaceWeatherData` and `SpaceUpdateGeolocationData` local interface types

---

## Phase 4 — Use cases

- [ ] **4.1** Create `src/core/spaces/application/use-cases/get-space-weather/get-space-weather.use-case.ts`
  - Class `GetSpaceWeatherUseCase` with `execute(spaceId: string): Promise<SpaceWeather | null>`
  - Named export `getSpaceWeatherUseCase` (singleton)

- [ ] **4.2** Create `src/core/spaces/application/use-cases/update-space-geolocation/update-space-geolocation.use-case.ts`
  - Class `UpdateSpaceGeolocationUseCase` with `execute(input: UpdateGeolocationInput): Promise<void>`
  - Named export `updateSpaceGeolocationUseCase` (singleton)

---

## Phase 5 — Presentation (hook + widget component)

- [ ] **5.1** Create `src/core/spaces/presentation/hooks/use-space-weather/use-space-weather.hook.ts`
  - Import `useQuery` from `@tanstack/react-query`
  - Instantiate `getSpaceWeatherUseCase` at module level (same pattern as `useSpaceDetail`)
  - Export `useSpaceWeather(spaceId: string | null)` with `queryKey`, `enabled`, `staleTime: 600_000`, `retry: 1`

- [ ] **5.2** Create `src/core/spaces/presentation/components/space-weather-widget/space-weather-widget.component.tsx`
  - Props: `{ spaceId: string; hasGeolocation?: boolean }`
  - Uses `useSpaceWeather`
  - Renders loading / no-geolocation / error / forecast states
  - Forecast grid: `grid-cols-2 sm:grid-cols-4 lg:grid-cols-7`
  - WMO code → emoji mapping inline
  - Uses shadcn/ui `Card`, `CardHeader`, `CardContent`, `CardTitle`
  - Uses i18n keys from `spaces` dictionary

---

## Phase 6 — i18n updates

- [ ] **6.1** Update `src/core/spaces/presentation/i18n/en.ts`
  - Add `weather` section: `title`, `forecast`, `temperatureUnit`, `precipitationUnit`, `setLocationForWeather`, `loading`, `error`, `noData`

- [ ] **6.2** Update `src/core/spaces/presentation/i18n/es.ts`
  - Add matching `weather` section in Spanish
  - Ensure `satisfies SpacesDictTranslated` still compiles
