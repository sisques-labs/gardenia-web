"use client";

import type { PlantingSpot } from "@/core/planting-spots/domain/interfaces/planting-spot.interface";
import type { PlantingSpotType } from "@/core/planting-spots/domain/types/planting-spot-type.type";
import { PlantingSpotTypeBadge } from "@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/presentation/components/ui/card/card";
import Link from "next/link";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";

type Props = {
  spot: PlantingSpot;
  dict: AppDict['plantingSpots'];
  lang: string;
};

function CapacityBar({ current, capacity }: { current: number; capacity: number }) {
  const pct = Math.min((current / capacity) * 100, 100);
  const over = current > capacity;
  return (
    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${over ? 'bg-destructive' : pct >= 100 ? 'bg-orange-400' : 'bg-[var(--forest)]'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CapacityBadge({ current, capacity, dict }: { current: number; capacity: number; dict: AppDict['plantingSpots'] }) {
  if (current > capacity) {
    return (
      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
        {dict.list.overCapacity}
      </span>
    );
  }
  if (current >= capacity) {
    return (
      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
        {dict.list.full}
      </span>
    );
  }
  return (
    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-[var(--forest)]/10 text-[var(--forest)]">
      {dict.list.available}
    </span>
  );
}

export function PlantingSpotCard({ spot, dict, lang }: Props) {
  const plantCount = spot.resolvedPlants?.length ?? 0;
  const hasCapacity = spot.capacity != null;
  const hasPosition = spot.row != null || spot.column != null;

  return (
    <Link href={`/${lang}/planting-spots/${spot.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{spot.name}</CardTitle>
            <PlantingSpotTypeBadge type={spot.type} dict={dict.types} />
          </div>

          {/* Position badge */}
          {hasPosition && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {spot.row != null && spot.column != null
                ? `F${spot.row} · C${spot.column}`
                : spot.row != null
                  ? `F${spot.row}`
                  : `C${spot.column}`}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-0 flex flex-col gap-2">
          {spot.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {spot.description}
            </p>
          )}

          {/* Capacity section */}
          {hasCapacity ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {plantCount} / {spot.capacity} {dict.list.plants}
                </span>
                <CapacityBadge
                  current={plantCount}
                  capacity={spot.capacity!}
                  dict={dict}
                />
              </div>
              <CapacityBar current={plantCount} capacity={spot.capacity!} />
            </div>
          ) : plantCount > 0 ? (
            <p className="text-xs text-muted-foreground">
              {plantCount} {dict.list.plants}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
