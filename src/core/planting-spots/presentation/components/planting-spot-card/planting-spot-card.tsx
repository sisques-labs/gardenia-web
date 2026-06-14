'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card';
import { PlantingSpotTypeBadge } from '@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge';
import type { PlantingSpot, PlantingSpotType } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

type Props = {
  spot: PlantingSpot;
  dict: { types: Record<PlantingSpotType, string> };
  lang: string;
};

export function PlantingSpotCard({ spot, dict, lang }: Props) {
  return (
    <Link href={`/${lang}/planting-spots/${spot.id}/edit`} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{spot.name}</CardTitle>
            <PlantingSpotTypeBadge type={spot.type} dict={dict.types} />
          </div>
        </CardHeader>
        {spot.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">{spot.description}</p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
