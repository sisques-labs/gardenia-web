import type { SpaceEnvironment } from '@/core/spaces/domain/types/space-environment.type';

export interface Space {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  latitude?: number | null;
  longitude?: number | null;
  environment?: SpaceEnvironment | null;
}
