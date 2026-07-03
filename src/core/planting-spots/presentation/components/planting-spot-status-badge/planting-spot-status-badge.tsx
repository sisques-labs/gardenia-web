"use client";

import type { PlantingSpotStatus } from "@/core/planting-spots/domain/types/planting-spot-status.type";
import { Badge } from "@/shared/presentation/components/ui/badge/badge";

type Props = {
  status: PlantingSpotStatus;
  dict: Record<PlantingSpotStatus, string>;
};

export function PlantingSpotStatusBadge({ status, dict }: Props) {
  return (
    <Badge variant={status === "FALLOW" ? "honey" : "forest"}>
      {dict[status]}
    </Badge>
  );
}
