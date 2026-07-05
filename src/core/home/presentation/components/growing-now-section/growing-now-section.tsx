'use client';

import { PlantCard } from '@/shared/presentation/components/ui/plant-card/plant-card';
import { EmptyState } from '@/shared/presentation/components/ui/empty-state/empty-state';
import { usePlants } from '@/core/plants/presentation/hooks/use-plants/use-plants.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { GrowingNowSkeleton } from '@/core/home/presentation/components/growing-now-section-skeleton/growing-now-section-skeleton';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const MAX_VISIBLE_PLANTS = 6;

type Props = {
  dict: AppDict['home'];
};

export function GrowingNowSection({ dict }: Props) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const { data: plants, isLoading } = usePlants(spaceId);

  if (isLoading) return <GrowingNowSkeleton />;

  const visiblePlants = plants ?? [];
  const remaining = visiblePlants.length - MAX_VISIBLE_PLANTS;

  return (
    <div className="card">
      <h2 className="text-base font-semibold mb-4">{dict.sections.growingNow.title}</h2>
      {visiblePlants.length === 0 ? (
        <EmptyState title={dict.sections.growingNow.empty} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {visiblePlants.slice(0, MAX_VISIBLE_PLANTS).map((plant) => (
              <PlantCard key={plant.id} name={plant.name} species={plant.species?.scientificName} imageUrl={plant.imageUrl} />
            ))}
          </div>
          {remaining > 0 && (
            <p className="text-xs text-muted-foreground mt-3">
              {dict.sections.growingNow.andMore.replace('{count}', String(remaining))}
            </p>
          )}
        </>
      )}
    </div>
  );
}
