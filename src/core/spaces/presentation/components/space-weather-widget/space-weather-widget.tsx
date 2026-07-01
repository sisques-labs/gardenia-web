'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card/card';
import { Skeleton } from '@/shared/presentation/components/ui/skeleton/skeleton';
import { useSpaceWeather } from '@/core/spaces/presentation/hooks/use-space-weather/use-space-weather.hook';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { DailyTile } from './daily-tile';

interface SpaceWeatherWidgetProps {
  spaceId: string;
  hasGeolocation?: boolean;
  weatherDict: AppDict['spaces']['weather'];
}

export function SpaceWeatherWidget({ spaceId, hasGeolocation = true, weatherDict }: SpaceWeatherWidgetProps) {
  const { data, isLoading, isError } = useSpaceWeather(hasGeolocation ? spaceId : null);

  if (!hasGeolocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{weatherDict.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {weatherDict.setLocationForWeather}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{weatherDict.title}</CardTitle>
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
          <CardTitle>{weatherDict.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            {weatherDict.error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.daily.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{weatherDict.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {weatherDict.noData}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{weatherDict.title}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {weatherDict.forecast} · {data.timezone}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {data.daily.map((day) => (
            <DailyTile
              key={day.date}
              forecast={day}
              temperatureUnit={weatherDict.temperatureUnit}
              precipitationUnit={weatherDict.precipitationUnit}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
