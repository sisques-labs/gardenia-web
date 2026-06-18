import type { SpaceEnvironment } from '@/core/spaces/domain/types/space-environment.type';

export interface UpdateGeolocationInput {
  spaceId: string;
  latitude?: number | null;
  longitude?: number | null;
  environment?: SpaceEnvironment | null;
}
