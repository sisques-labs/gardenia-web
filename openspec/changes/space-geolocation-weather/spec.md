# Spec: Space Geolocation & Weather

## File Structure

### New files

```
src/core/spaces/domain/types/space-environment.type.ts
src/core/spaces/domain/interfaces/space-weather.interface.ts
src/core/spaces/application/interfaces/update-geolocation-input.interface.ts
src/core/spaces/infrastructure/repositories/graphql/queries/space-weather.query.ts
src/core/spaces/infrastructure/repositories/graphql/mutations/space-update-geolocation.mutation.ts
src/core/spaces/application/use-cases/get-space-weather/get-space-weather.use-case.ts
src/core/spaces/application/use-cases/update-space-geolocation/update-space-geolocation.use-case.ts
src/core/spaces/presentation/hooks/use-space-weather/use-space-weather.hook.ts
src/core/spaces/presentation/components/space-weather-widget/space-weather-widget.component.tsx
```

### Modified files

```
src/core/spaces/domain/interfaces/space.interface.ts
src/core/spaces/domain/interfaces/space-detail.interface.ts
src/core/spaces/application/ports/spaces.repository.port.ts
src/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository.ts
src/core/spaces/presentation/i18n/en.ts
src/core/spaces/presentation/i18n/es.ts
```

---

## Type Contracts

### SpaceEnvironment

```typescript
type SpaceEnvironment = 'INDOOR' | 'OUTDOOR' | 'MIXED';
```

- Three literal values only.
- Serialised as-is over GraphQL (matches API enum casing).

### Space (delta)

```typescript
interface Space {
  // ... existing fields ...
  latitude?: number | null;
  longitude?: number | null;
  environment?: SpaceEnvironment | null;
}
```

### SpaceDetail (delta)

Same optional geolocation fields as `Space`.

### DailyForecast

```typescript
interface DailyForecast {
  date: string;           // ISO-8601 date, "YYYY-MM-DD"
  temperatureMin: number;
  temperatureMax: number;
  precipitationSum: number;
  weatherCode: number;    // WMO code integer
}
```

### SpaceWeather

```typescript
interface SpaceWeather {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: DailyForecast[];
}
```

---

## GraphQL Operation Shapes

### Query: spaceWeather

```graphql
query SpaceWeather($input: SpaceWeatherRequestDto!) {
  spaceWeather(input: $input) {
    latitude
    longitude
    timezone
    daily {
      date
      temperatureMin
      temperatureMax
      precipitationSum
      weatherCode
    }
  }
}
```

- Variable: `{ input: { spaceId: string } }`
- Returns `SpaceWeather | null`.

### Mutation: spaceUpdateGeolocation

```graphql
mutation SpaceUpdateGeolocation($input: SpaceUpdateGeolocationRequestDto!) {
  spaceUpdateGeolocation(input: $input) {
    id
    success
    message
  }
}
```

- Variable: `{ input: UpdateGeolocationInput }`
- Returns standard `{ id, success, message }` envelope.
- Repository throws `Error` if `success === false`.

---

## Repository Port Contract

```typescript
interface ISpacesRepository {
  // ... existing methods ...
  getSpaceWeather(spaceId: string): Promise<SpaceWeather | null>;
  updateGeolocation(input: UpdateGeolocationInput): Promise<void>;
}
```

---

## Use Case Contracts

### GetSpaceWeatherUseCase

```typescript
class GetSpaceWeatherUseCase {
  execute(spaceId: string): Promise<SpaceWeather | null>
}
export const getSpaceWeatherUseCase: GetSpaceWeatherUseCase;
```

### UpdateSpaceGeolocationUseCase

```typescript
class UpdateSpaceGeolocationUseCase {
  execute(input: UpdateGeolocationInput): Promise<void>
}
export const updateSpaceGeolocationUseCase: UpdateSpaceGeolocationUseCase;
```

---

## Hook Behaviour

### useSpaceWeather(spaceId: string | null)

- Returns TanStack Query result (`UseQueryResult<SpaceWeather | null>`).
- `queryKey`: `['space-weather', spaceId]`.
- `enabled`: `!!spaceId`.
- `staleTime`: `10 * 60 * 1000` (10 minutes).
- `retry`: `1`.
- When `spaceId` is `null` or `undefined`, query is disabled and `data` is `undefined`.

---

## Component Rendering Scenarios

### SpaceWeatherWidget({ spaceId, hasGeolocation? })

| Scenario | Condition | Rendered output |
|----------|-----------|----------------|
| Loading | `isLoading === true` | Skeleton card with shimmer placeholders |
| No geolocation | `hasGeolocation === false` or `data === null` | Prompt card: "Set a location in space settings to see weather" |
| Error | `isError === true` | Error card: "Could not load weather. Try again." |
| Forecast | `data` is `SpaceWeather` with `daily.length > 0` | Grid of 7 `DailyForecast` tiles |

Each tile shows: date (short locale string), weather emoji (from WMO code map), `temperatureMin`°/`temperatureMax`°C, `precipitationSum` mm.

---

## Acceptance Scenarios

### Scenario 1: Space with geolocation shows 7-day forecast

**Given** a space with `latitude` and `longitude` set  
**And** the `spaceWeather` query returns a `SpaceWeather` object with 7 `DailyForecast` entries  
**When** `SpaceWeatherWidget` is rendered with that `spaceId`  
**Then** 7 daily forecast tiles are visible  
**And** each tile displays a min/max temperature and precipitation value  

### Scenario 2: Space without geolocation shows prompt

**Given** a space with `latitude === null` and `longitude === null`  
**When** `SpaceWeatherWidget` is rendered with `hasGeolocation={false}`  
**Then** the widget displays a prompt to set a location in space settings  
**And** no weather data is fetched  

### Scenario 3: Loading state renders skeleton

**Given** `useSpaceWeather` is in a pending/loading state  
**When** `SpaceWeatherWidget` is rendered  
**Then** skeleton placeholders are visible instead of forecast tiles  

### Scenario 4: updateGeolocation sets lat/lon on a space

**Given** a space without geolocation  
**When** `UpdateSpaceGeolocationUseCase.execute({ spaceId, latitude: 40.4, longitude: -3.7, environment: 'OUTDOOR' })` is called  
**Then** the `spaceUpdateGeolocation` mutation is sent with the correct variables  
**And** the use case resolves without error if `success === true`  

### Scenario 5: updateGeolocation propagates server errors

**Given** the API returns `{ success: false, message: 'Forbidden' }`  
**When** `UpdateSpaceGeolocationUseCase.execute(input)` is called  
**Then** the use case throws an `Error` with message `'Forbidden'`  

### Scenario 6: i18n keys are type-safe

**Given** `es.ts` uses `satisfies SpacesDictTranslated`  
**When** a weather key is added to `en.ts` but omitted from `es.ts`  
**Then** TypeScript emits a compile error  
