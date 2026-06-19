import type { DailyForecast } from '@/core/spaces/domain/interfaces/daily-forecast.interface';
import { formatDate } from '@/shared/presentation/utils/format-date.util';

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
