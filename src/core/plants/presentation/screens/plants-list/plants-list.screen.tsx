'use client';

import { Button } from '@/shared/presentation/components/ui/button';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { PlantCard } from '@/core/plants/presentation/components/plant-card/plant-card';
import { usePlants } from '@/core/plants/presentation/hooks/use-plants/use-plants.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shimmer = 'bg-muted rounded animate-pulse';

function PlantCardSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full ${shimmer}`} />
        <div className="flex-1 flex flex-col gap-2">
          <div className={`h-4 w-3/4 ${shimmer}`} />
          <div className={`h-3 w-1/2 ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}

type Props = {
  dict: AppDict['plants'];
  lang: string;
  spaceId: string | null;
};

export function PlantsListScreen({ dict, lang, spaceId: spaceIdProp }: Props) {
  const storeSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const spaceId = spaceIdProp ?? storeSpaceId;
  const { data: plants, isLoading } = usePlants(spaceId);

  return (
    <div className="p-6">
      <ScreenHeader
        title={dict.list.title}
        actions={
          <Button disabled>{dict.list.newPlant}</Button>
        }
      />

      <div className="flex gap-2 mt-6 mb-4 overflow-x-auto">
        <button className="px-3 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground">
          {dict.list.filterAll}
        </button>
        {['Hortaliza', 'Aromática', 'Hoja', 'Raíz', 'Flor', 'Árbol'].map((cat) => (
          <button key={cat} disabled className="px-3 py-1.5 text-sm font-medium rounded-full bg-muted text-muted-foreground cursor-not-allowed">
            {cat}
          </button>
        ))}
      </div>

      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <PlantCardSkeleton key={i} />
            ))}
          </div>
        ) : !plants || plants.length === 0 ? (
          <p className="text-muted-foreground">{dict.list.empty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                lang={lang}
                noSpecies={dict.detail.noSpecies}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

