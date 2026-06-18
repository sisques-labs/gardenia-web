import type { SpaceEnvironment } from '@/core/spaces/domain/types/space-environment.type';
import type { SpaceWeather } from '@/core/spaces/domain/interfaces/space-weather.interface';

export interface SpaceDetail {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
  latitude?: number | null;
  longitude?: number | null;
  environment?: SpaceEnvironment | null;
  weather?: SpaceWeather | null;
}
