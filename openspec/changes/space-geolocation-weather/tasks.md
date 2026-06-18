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

- [x] **1.1** Create `src/core/spaces/domain/types/space-environment.type.ts`
  - Export `SpaceEnvironment = 'INDOOR' | 'OUTDOOR' | 'MIXED'`

- [x] **1.2** Update `src/core/spaces/domain/interfaces/space.interface.ts`
  - Import `SpaceEnvironment` type
  - Add `latitude?: number | null`, `longitude?: number | null`, `environment?: SpaceEnvironment | null`

- [x] **1.3** Update `src/core/spaces/domain/interfaces/space-detail.interface.ts`
  - Same three optional geolocation fields as above

- [x] **1.4** Create `src/core/spaces/domain/interfaces/space-weather.interface.ts`
  - Export `DailyForecast` interface (date, temperatureMin, temperatureMax, precipitationSum, weatherCode)
  - Export `SpaceWeather` interface (latitude, longitude, timezone, daily: DailyForecast[])

---

## Phase 2 — Application interfaces and port

- [x] **2.1** Create `src/core/spaces/application/interfaces/update-geolocation-input.interface.ts`
  - Export `UpdateGeolocationInput` with `spaceId: string`, optional lat/lon/environment

- [x] **2.2** Update `src/core/spaces/application/ports/spaces.repository.port.ts`
  - Import `SpaceWeather` from domain interfaces
  - Import `UpdateGeolocationInput` from application interfaces
  - Add `getSpaceWeather(spaceId: string): Promise<SpaceWeather | null>` to `ISpacesRepository`
  - Add `updateGeolocation(input: UpdateGeolocationInput): Promise<void>` to `ISpacesRepository`

---

## Phase 3 — Infrastructure (GQL documents + repository methods)

- [x] **3.1** Create `src/core/spaces/infrastructure/repositories/graphql/queries/space-weather.query.ts`
  - (deprecated — weather is now resolved via `spaceFindById`)

- [x] **3.2** Create `src/core/spaces/infrastructure/repositories/graphql/mutations/space-update-geolocation.mutation.ts`
  - Export `SPACE_UPDATE` GQL document targeting `spaceUpdate(input: SpaceUpdateRequestDto!)`

- [x] **3.3** Update `src/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository.ts`
  - Implement `getSpaceWeather(spaceId)` via `spaceFindById` (weather is a resolved field)
  - Implement `updateGeolocation(input)` using `SPACE_UPDATE` mutation
  - Updated `SPACE_FIND_BY_ID` query to include `latitude`, `longitude`, `environment` fields

---

## Phase 4 — Use cases

- [x] **4.1** Create `src/core/spaces/application/use-cases/get-space-weather/get-space-weather.use-case.ts`
  - Class `GetSpaceWeatherUseCase` with `execute(spaceId: string): Promise<SpaceWeather | null>`
  - Named export `getSpaceWeatherUseCase` (singleton)

- [x] **4.2** Create `src/core/spaces/application/use-cases/update-space-geolocation/update-space-geolocation.use-case.ts`
  - Class `UpdateSpaceGeolocationUseCase` with `execute(input: UpdateGeolocationInput): Promise<void>`
  - Named export `updateSpaceGeolocationUseCase` (singleton)

---

## Phase 5 — Presentation (hook + widget component)

- [x] **5.1** Create `src/core/spaces/presentation/hooks/use-space-weather/use-space-weather.hook.ts`
  - Export `useSpaceWeather(spaceId: string | null)` with `queryKey`, `enabled`, `staleTime: 600_000`, `retry: 1`

- [x] **5.2** Create `src/core/spaces/presentation/components/space-weather-widget/space-weather-widget.component.tsx`
  - Props: `{ spaceId: string; hasGeolocation?: boolean; weatherDict }`
  - Uses `useSpaceWeather`
  - Renders loading / no-geolocation / error / forecast states
  - WMO code → emoji mapping inline

- [x] **5.3** Create `src/core/spaces/presentation/hooks/use-update-geolocation/use-update-geolocation.hook.ts`
  - `useMutation` hook calling `updateSpaceGeolocationUseCase`

- [x] **5.4** Update `useSpaceSettings` hook with geolocation form + `onUpdateGeolocation` handler

- [x] **5.5** Update `SpaceSettingsScreen` with geolocation card + weather widget
  - Geolocation card (owner only): latitude, longitude, environment select, save button
  - Weather widget mounted below space details

---

## Phase 6 — i18n updates

- [x] **6.1** Update `src/core/spaces/presentation/i18n/en.ts`
  - Added `weather` section
  - Added `settings.geolocation` section

- [x] **6.2** Update `src/core/spaces/presentation/i18n/es.ts`
  - Added matching sections in Spanish
