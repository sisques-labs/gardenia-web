"use client";

import type { PlantingSpotType } from "@/core/planting-spots/domain/types/planting-spot-type.type";
import { Badge } from "@/shared/presentation/components/ui/badge/badge";

type Props = {
  type: PlantingSpotType;
  dict: Record<PlantingSpotType, string>;
};

export function PlantingSpotTypeBadge({ type, dict }: Props) {
  return <Badge variant="secondary">{dict[type]}</Badge>;
}
