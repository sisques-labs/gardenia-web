import type { DailyForecast } from '@/core/spaces/domain/interfaces/daily-forecast.interface';

export type { DailyForecast };

export interface SpaceWeather {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: DailyForecast[];
}
