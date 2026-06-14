'use client';

import { Badge } from '@/shared/presentation/components/ui/badge';
import type { PlantingSpotType } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

type Props = {
  type: PlantingSpotType;
  dict: Record<PlantingSpotType, string>;
};

export function PlantingSpotTypeBadge({ type, dict }: Props) {
  return <Badge variant="secondary">{dict[type]}</Badge>;
}
