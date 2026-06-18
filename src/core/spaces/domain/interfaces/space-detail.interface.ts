import type { SpaceEnvironment } from '@/core/spaces/domain/types/space-environment.type';

export interface SpaceDetail {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
  latitude?: number | null;
  longitude?: number | null;
  environment?: SpaceEnvironment | null;
}
