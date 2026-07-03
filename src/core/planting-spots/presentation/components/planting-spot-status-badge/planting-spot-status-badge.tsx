"use client";

import type { PlantingSpotStatus } from "@/core/planting-spots/domain/types/planting-spot-status.type";
import { Badge, type BadgeProps } from "@/shared/presentation/components/ui/badge/badge";

type Props = {
  status: PlantingSpotStatus;
  dict: Record<PlantingSpotStatus, string>;
};

const STATUS_BADGE_VARIANT: Record<PlantingSpotStatus, BadgeProps["variant"]> = {
  ACTIVE: "forest",
  FALLOW: "honey",
};

export function PlantingSpotStatusBadge({ status, dict }: Props) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]}>{dict[status]}</Badge>
  );
}
