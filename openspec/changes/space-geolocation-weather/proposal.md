# Proposal: Space Geolocation & Weather

## Intent

Spaces have no location awareness. Gardeners who manage outdoor beds, greenhouses, or rooftop gardens need to know what the weather will be like at their specific growing site over the coming week. Without geolocation on a space, the frontend cannot fetch relevant weather data, and users must rely on external apps to plan watering or frost protection. This change attaches optional latitude/longitude/environment fields to the Space domain and exposes a 7-day weather forecast widget backed by a `spaceWeather` GraphQL query.

## Scope

### In Scope
- Optional `latitude`, `longitude`, `environment` (INDOOR / OUTDOOR / MIXED) fields on `Space` and `SpaceDetail` domain interfaces.
- New `SpaceEnvironment` string-union type.
- New `SpaceWeather` / `DailyForecast` domain interfaces.
- `ISpacesRepository` extension: `getSpaceWeather(spaceId)` and `updateGeolocation(input)`.
- New application interface `UpdateGeolocationInput`.
- New GraphQL query `SPACE_WEATHER` and mutation `SPACE_UPDATE_GEOLOCATION` in the GQL layer.
- Repository implementation of both new methods in `SpacesGqlRepository`.
- Two new use cases: `GetSpaceWeatherUseCase` and `UpdateSpaceGeolocationUseCase`.
- TanStack Query hook `useSpaceWeather`.
- React component `SpaceWeatherWidget` rendering a 7-day forecast card.
- i18n keys in `en.ts` / `es.ts` for all new UI strings.

### Out of Scope
- FrostAlert, RainExpected, or any other alert type.
- Tasks-engine integration (no auto-generated tasks from weather events).
- Server-side rendering of weather data.
- Push/email notifications triggered by weather thresholds.
- Caching weather data server-side (handled by Open-Meteo adapter in the API layer).

## Capabilities

### New Capabilities
- `space-geolocation`: optional lat/lon/environment on a space, settable via `spaceUpdateGeolocation` mutation.
- `space-weather`: 7-day forecast fetched on demand per space via `spaceWeather` query, displayed in `SpaceWeatherWidget`.

### Modified Capabilities
- `spaces-domain`: `Space` and `SpaceDetail` interfaces gain optional geolocation fields.
- `spaces-repository-port`: `ISpacesRepository` gains two new method signatures.
- `spaces-gql-repository`: two new method implementations wired to new GQL documents.
- `spaces-i18n`: English and Spanish dictionaries extended with weather keys.

## Approach

Extend the existing `core/spaces/` DDD domain in-place. Geolocation fields are optional (`? : number | null`) so all existing Space-consuming code continues to compile without changes. The `SpaceEnvironment` union is a plain TypeScript string union — no class, no enum — keeping it serialisation-friendly. The `SpaceWeather` interface mirrors the Open-Meteo 7-day shape expected from the API adapter. The GQL query uses `network-only` fetch policy so the widget always reflects the latest forecast. The mutation follows the same `{ id, success, message }` response envelope pattern used by every other space mutation. The widget is a self-contained presentational component; it accepts a `spaceId` prop, delegates data fetching to `useSpaceWeather`, and renders loading/empty/error/forecast states with shadcn/ui `Card` primitives and Tailwind utilities.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/core/spaces/domain/interfaces/space.interface.ts` | Modified | Add optional `latitude`, `longitude`, `environment` fields |
| `src/core/spaces/domain/interfaces/space-detail.interface.ts` | Modified | Same optional fields |
| `src/core/spaces/domain/types/space-environment.type.ts` | New | `SpaceEnvironment` string union |
| `src/core/spaces/domain/interfaces/space-weather.interface.ts` | New | `DailyForecast` and `SpaceWeather` interfaces |
| `src/core/spaces/application/interfaces/update-geolocation-input.interface.ts` | New | Input shape for geolocation mutation |
| `src/core/spaces/application/ports/spaces.repository.port.ts` | Modified | Two new method signatures |
| `src/core/spaces/infrastructure/repositories/graphql/queries/space-weather.query.ts` | New | `SPACE_WEATHER` GQL document |
| `src/core/spaces/infrastructure/repositories/graphql/mutations/space-update-geolocation.mutation.ts` | New | `SPACE_UPDATE_GEOLOCATION` GQL document |
| `src/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository.ts` | Modified | `getSpaceWeather` and `updateGeolocation` implementations |
| `src/core/spaces/application/use-cases/get-space-weather/get-space-weather.use-case.ts` | New | Use case wrapper |
| `src/core/spaces/application/use-cases/update-space-geolocation/update-space-geolocation.use-case.ts` | New | Use case wrapper |
| `src/core/spaces/presentation/hooks/use-space-weather/use-space-weather.hook.ts` | New | TanStack Query hook |
| `src/core/spaces/presentation/components/space-weather-widget/space-weather-widget.component.tsx` | New | 7-day forecast widget |
| `src/core/spaces/presentation/i18n/en.ts` | Modified | Weather i18n keys |
| `src/core/spaces/presentation/i18n/es.ts` | Modified | Weather i18n keys (Spanish) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| API `spaceWeather` query not yet implemented | Medium | Widget gracefully renders empty state; query is gated on `enabled: !!spaceId && hasGeolocation` |
| Geolocation fields absent on older Space records | Low | Fields typed as `latitude?: number \| null` — undefined and null both render the "set location" prompt |
| Weather API rate-limit or downtime | Low | `staleTime: 10 * 60 * 1000` in the hook avoids redundant fetches; error state shown on failure |
| TypeScript strict-null regressions in consumers | Low | Fields are strictly optional; existing Space usages need no changes |

## Rollback Plan

All changes are additive or isolated behind optional interface fields. Reverting the PR removes the new files entirely and reverts the four modified files to their pre-change state. No database migrations are owned by the frontend. The API team can independently revert or feature-flag their `spaceWeather`/`spaceUpdateGeolocation` resolvers.

## Dependencies

- API team must implement `spaceWeather(input: SpaceWeatherRequestDto!)` query (Open-Meteo adapter) and `spaceUpdateGeolocation(input: SpaceUpdateGeolocationRequestDto!)` mutation.
- `Space` and `SpaceDetail` GQL types on the API must expose `latitude`, `longitude`, `environment`.

## Success Criteria

- [ ] `Space` and `SpaceDetail` TypeScript interfaces compile with optional geolocation fields; all existing consumers still compile.
- [ ] `ISpacesRepository` port includes `getSpaceWeather` and `updateGeolocation`; `SpacesGqlRepository` satisfies the interface.
- [ ] `SpaceWeatherWidget` renders a 7-day forecast when weather data is available.
- [ ] `SpaceWeatherWidget` renders a "set location" prompt when `latitude`/`longitude` are absent.
- [ ] `SpaceWeatherWidget` renders a loading skeleton while the query is in flight.
- [ ] i18n keys present in both `en.ts` and `es.ts` with no missing keys (TypeScript `satisfies` check passes).
