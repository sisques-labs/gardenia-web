'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card';
import { Skeleton } from '@/shared/presentation/components/ui/skeleton';
import { useSpaceWeather } from '@/core/spaces/presentation/hooks/use-space-weather/use-space-weather.hook';
import type { DailyForecast } from '@/core/spaces/domain/interfaces/space-weather.interface';

const WMO_EMOJI: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌦️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '🌨️',
  80: '🌦️',
  81: '🌦️',
  82: '⛈️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

function weatherEmoji(code: number): string {
  return WMO_EMOJI[code] ?? '🌡️';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

interface DailyTileProps {
  forecast: DailyForecast;
}

function DailyTile({ forecast }: DailyTileProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 text-center text-sm">
      <span className="text-xs text-muted-foreground font-medium">{formatDate(forecast.date)}</span>
      <span className="text-2xl" role="img" aria-label={`Weather code ${forecast.weatherCode}`}>
        {weatherEmoji(forecast.weatherCode)}
      </span>
      <span className="font-semibold">
        {Math.round(forecast.temperatureMin)}° / {Math.round(forecast.temperatureMax)}°
      </span>
      <span className="text-xs text-muted-foreground">{forecast.precipitationSum} mm</span>
    </div>
  );
}

interface SpaceWeatherWidgetProps {
  spaceId: string;
  hasGeolocation?: boolean;
}

export function SpaceWeatherWidget({ spaceId, hasGeolocation = true }: SpaceWeatherWidgetProps) {
  const { data, isLoading, isError } = useSpaceWeather(hasGeolocation ? spaceId : null);

  if (!hasGeolocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Set a location in space settings to see the weather forecast.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Could not load weather data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.daily.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No weather data available for this location.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather</CardTitle>
        <p className="text-xs text-muted-foreground">
          7-day forecast · {data.timezone}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {data.daily.map((day) => (
            <DailyTile key={day.date} forecast={day} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
