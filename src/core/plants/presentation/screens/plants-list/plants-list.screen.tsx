'use client';

import { useState } from 'react';
import { Button } from '@/shared/presentation/components/ui/button';
import { Alert } from '@/shared/presentation/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/presentation/components/ui/tabs';
import { PlantCard } from '@/core/plants/presentation/components/plant-card/plant-card';
import { usePlants } from '@/core/plants/presentation/hooks/use-plants/use-plants.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { CreatePlantModal } from '@/core/plants/presentation/components/create-plant-modal/create-plant-modal';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shimmer = 'bg-muted rounded animate-pulse';

const CATEGORY_FILTERS = ['Hortaliza', 'Aromática', 'Hoja', 'Raíz', 'Flor', 'Árbol'] as const;

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const plantCount = plants?.length ?? 0;
  const speciesCount = new Set(plants?.filter((p) => p.plantSpeciesId).map((p) => p.plantSpeciesId)).size;

  return (
    <div>
      {/* Header */}
      <header className="flex flex-col gap-1 px-6 py-4 border-b border-[var(--rule)]">
        <p className="text-xs text-[var(--ink)]/60">
          {dict.nav} · {plantCount} {dict.list.statsPlants} · {speciesCount} {dict.list.statsSpecies}
        </p>
        <div className="flex items-center">
          <h1 className="headline text-[var(--ink)]">{dict.list.title}</h1>
          <div className="ml-auto">
            <Button onClick={() => setIsCreateOpen(true)}>{dict.list.newPlant}</Button>
          </div>
        </div>
      </header>

      {/* Filter tabs */}
      <Tabs defaultValue="all" className="px-6 border-b border-[var(--rule)]">
        <div className="flex items-center">
          <TabsList variant="line" className="flex-1 overflow-x-auto justify-start rounded-none h-auto border-0 pb-0 gap-0">
            <TabsTrigger value="all" className="whitespace-nowrap py-3 px-4">
              {dict.list.filterAll}
              <span className="ml-1.5 text-xs font-normal opacity-60">{plantCount}</span>
            </TabsTrigger>
            {CATEGORY_FILTERS.map((cat) => (
              <TabsTrigger key={cat} value={cat.toLowerCase()} disabled className="whitespace-nowrap py-3 px-4">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          <button
            disabled
            className="shrink-0 px-4 py-3 text-sm font-medium text-[var(--ink)]/40 whitespace-nowrap cursor-not-allowed"
          >
            {dict.list.filters}
          </button>
        </div>

        {/* Content */}
        <TabsContent value="all" className="pt-6 pb-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <PlantCardSkeleton key={i} />
              ))}
            </div>
          ) : !plants || plants.length === 0 ? (
            <Alert variant="info" message={dict.list.empty} />
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
        </TabsContent>
      </Tabs>

      {isCreateOpen && (
        <CreatePlantModal
          spaceId={spaceId}
          dict={dict.create}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </div>
  );
}
