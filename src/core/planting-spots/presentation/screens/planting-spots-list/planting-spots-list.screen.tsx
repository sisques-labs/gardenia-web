'use client';

import { useState } from 'react';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { PlantingSpotCard } from '@/core/planting-spots/presentation/components/planting-spot-card/planting-spot-card';
import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { CreatePlantingSpotModal } from '@/core/planting-spots/presentation/components/create-planting-spot-modal/create-planting-spot-modal';
import { PlantingSpotsListSkeleton } from '@/core/planting-spots/presentation/components/planting-spots-list-skeleton/planting-spots-list-skeleton';
import { Pagination } from '@/shared/presentation/components/ui/pagination/pagination';
import { useUrlPage } from '@/shared/presentation/hooks/use-url-page/use-url-page.hook';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['plantingSpots'];
  lang: string;
};

export function PlantingSpotsListScreen({ dict, lang }: Props) {
  const { page, onPageChange } = useUrlPage();
  const { spots, totalPages, currentPage, isLoading } = usePlantingSpots(page);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div>
      <ScreenHeader
        title={dict.list.title}
        actions={
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            {dict.list.new}
          </Button>
        }
      />

      <div className="px-6 py-6">
        {isLoading ? (
          <PlantingSpotsListSkeleton />
        ) : spots.length === 0 ? (
          <p className="text-muted-foreground text-sm">{dict.list.empty}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {spots.map((spot) => (
                <PlantingSpotCard key={spot.id} spot={spot} dict={dict} lang={lang} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {isCreateOpen && (
        <CreatePlantingSpotModal dict={dict} onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
