import type { SpaceEnvironment } from '@/core/spaces/domain/types/space-environment.type';

export interface UpdateSpaceInput {
  spaceId: string;
  latitude?: number | null;
  longitude?: number | null;
  environment?: SpaceEnvironment | null;
}
