# Design: Space Geolocation & Weather

## 1. Why geolocation fields are optional

Not every space is outdoors. A user might have a single indoor propagation shelf where weather is irrelevant, alongside an outdoor raised bed. Making `latitude`, `longitude`, and `environment` required on `Space` would force every existing record — and every existing code path — to handle values it does not need. Optional fields (`?: number | null`) let indoor spaces simply omit them, and the widget can detect the absence and prompt the user to set a location rather than crashing or showing meaningless data.

Using `number | null` (rather than just `number | undefined`) mirrors how GraphQL nullable scalars deserialise: Apollo returns `null` for explicitly-null server fields, not `undefined`. TypeScript `undefined` would only appear when the field is absent from the response altogether (e.g. an older cached fragment). Both cases are handled by the `??` nullish coalescing guard in the widget.

## 2. SpaceEnvironment type

```typescript
export type SpaceEnvironment = 'INDOOR' | 'OUTDOOR' | 'MIXED';
```

A plain TypeScript string union (not an enum class, not a const object) was chosen for three reasons:

1. **Serialisation**: GraphQL enum values are strings over the wire. A string union round-trips without a mapping layer.
2. **Tree-shaking**: No runtime object is emitted — the type is erased at compile time.
3. **Simplicity**: Consumers pattern-match with a simple `switch` or `===` comparison; no `.valueOf()` or key-lookup needed.

The three values (`INDOOR`, `OUTDOOR`, `MIXED`) map 1-to-1 to the API GraphQL enum. `MIXED` covers greenhouses, polytunnels, and spaces that span both indoors and outdoors.

## 3. SpaceWeather interface design

```typescript
export interface DailyForecast {
  date: string;           // ISO-8601 date string, e.g. "2025-06-18"
  temperatureMin: number; // °C
  temperatureMax: number; // °C
  precipitationSum: number; // mm
  weatherCode: number;    // WMO Weather interpretation code
}

export interface SpaceWeather {
  latitude: number;
  longitude: number;
  timezone: string;       // IANA timezone, e.g. "Europe/Madrid"
  daily: DailyForecast[];
}
```

The shape mirrors the Open-Meteo response structure that the API adapter is expected to return. `weatherCode` is the WMO code (integer), allowing the frontend to map it to an icon or label without fetching additional metadata. Temperature is in Celsius (SI units match the API default). The `timezone` field is retained so the widget can display local dates correctly if needed in a future iteration.

The interface intentionally omits `hourly` data — a 7-day daily summary is sufficient for the initial widget and avoids transmitting large payloads over GraphQL.

## 4. Component design: SpaceWeatherWidget

### Responsibilities
- Accept a single `spaceId: string` prop.
- Delegate data fetching entirely to `useSpaceWeather(spaceId)` — the component is presentational after the hook boundary.
- Render four states:
  - **Loading**: A skeleton card with shimmer placeholders for each forecast day.
  - **No geolocation**: A prompt card with a message directing the user to space settings.
  - **Error**: A minimal error card with a retry-friendly message.
  - **Forecast**: A `Card` containing a 7-column grid of daily forecast tiles (date, weather-code icon via emoji or class, min/max temp, precipitation).

### Styling choices
- **shadcn/ui `Card`, `CardHeader`, `CardContent`**: Consistent with the rest of the settings UI.
- **Tailwind CSS grid**: `grid-cols-2 sm:grid-cols-4 lg:grid-cols-7` — collapses gracefully on mobile.
- **No external chart library**: Min/max temperatures are displayed as plain text (e.g. `14° / 22°`) rather than a chart to avoid bundle bloat and render complexity.
- Weather codes are mapped to a small inline lookup object (WMO → emoji) defined within the component file; this is intentionally not extracted to a separate util at this stage.

### Props interface
```typescript
interface SpaceWeatherWidgetProps {
  spaceId: string;
  hasGeolocation?: boolean; // pre-computed from space lat/lon to avoid re-querying
}
```

The optional `hasGeolocation` flag allows the parent to short-circuit the query without the hook having to fetch the space detail itself — keeping the hook lean.

## 5. Hook design: useSpaceWeather

```typescript
export function useSpaceWeather(spaceId: string | null) {
  return useQuery({
    queryKey: ['space-weather', spaceId],
    queryFn: () => getSpaceWeatherUseCase.execute(spaceId!),
    enabled: !!spaceId,
    staleTime: 10 * 60 * 1000, // 10 minutes — weather data does not change by the second
    retry: 1,
  });
}
```

**staleTime rationale**: Weather forecasts from Open-Meteo are updated at most every hour. A 10-minute stale window avoids redundant network requests when the user navigates between pages, while still fetching fresh data after a meaningful pause.

**retry: 1**: A single retry handles transient network blips without hammering the API on a real outage.

**Singleton use-case pattern**: The hook instantiates the use case once at module level (same pattern as `useSpaceDetail`), avoiding re-creation on every render.

## 6. Error and loading states

| State | Trigger | Render |
|-------|---------|--------|
| Loading | `isLoading === true` | Skeleton placeholders inside a `Card` |
| No geolocation | `hasGeolocation === false` | Prompt: "Set a location in space settings to see weather" |
| Error | `isError === true` | Error message with suggestion to retry |
| Empty data | `data === null` | Same as no-geolocation (API returned null — space has no coords) |
| Success | `data` is a `SpaceWeather` object | 7-day grid of `DailyForecast` tiles |

## 7. UpdateGeolocation mutation design

The mutation follows the same `{ id, success, message }` envelope already used by `spaceCreate`, `spaceAddMember`, etc. The repository method throws if `success` is `false`, surfacing the server message to the calling use case. The use case in turn propagates the error upward to any mutation hook (TanStack `useMutation`) that wraps it.

`UpdateGeolocationInput` carries all three fields as optional so a caller can update only `environment` without resetting lat/lon, or vice versa.
