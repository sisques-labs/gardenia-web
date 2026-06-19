import type { DailyForecast } from '@/core/spaces/domain/interfaces/daily-forecast.interface';
import { weatherEmoji, formatDate } from './wmo-weather.utils';

interface DailyTileProps {
  forecast: DailyForecast;
  temperatureUnit: string;
  precipitationUnit: string;
}

export function DailyTile({ forecast, temperatureUnit, precipitationUnit }: DailyTileProps) {
  const emoji = weatherEmoji(forecast.weatherCode);

  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-card p-3 text-center text-sm">
      <span className="text-xs text-muted-foreground font-medium">{formatDate(forecast.date)}</span>
      <span className="text-2xl" aria-hidden="true">{emoji}</span>
      <span className="sr-only">{`Weather: ${emoji}`}</span>
      <span className="font-semibold">
        {Math.round(forecast.temperatureMin)}{temperatureUnit} / {Math.round(forecast.temperatureMax)}{temperatureUnit}
      </span>
      <span className="text-xs text-muted-foreground">{forecast.precipitationSum} {precipitationUnit}</span>
    </div>
  );
}
