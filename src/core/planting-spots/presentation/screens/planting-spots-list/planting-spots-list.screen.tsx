'use client';

import Link from 'next/link';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { PlantingSpotCard } from '@/core/planting-spots/presentation/components/planting-spot-card/planting-spot-card';
import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { buttonVariants } from '@/shared/presentation/components/ui/button/button';
import { PlantingSpotsListSkeleton } from '@/core/planting-spots/presentation/components/planting-spots-list-skeleton/planting-spots-list-skeleton';
import { Pagination } from '@/shared/presentation/components/ui/pagination/pagination';
import { useUrlPagination } from '@/shared/presentation/hooks/use-url-pagination/use-url-pagination.hook';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const PAGE_SIZE = 12;

type Props = {
  dict: AppDict['plantingSpots'];
  lang: string;
};

export function PlantingSpotsListScreen({ dict, lang }: Props) {
  const { spots, isLoading } = usePlantingSpots();
  const { currentPage, totalPages, pagedItems: pagedSpots, onPageChange } = useUrlPagination(spots, PAGE_SIZE);

  return (
    <div>
      <ScreenHeader
        title={dict.list.title}
        actions={
          <Link href={`/${lang}/planting-spots/new`} className={buttonVariants({ size: 'sm' })}>
            {dict.list.new}
          </Link>
        }
      />

      <div className="px-6 py-6">
        {isLoading ? (
          <PlantingSpotsListSkeleton />
        ) : spots.length === 0 ? (
          <p className="text-muted-foreground text-sm">{dict.list.empty}</p>
        ) : pagedSpots.length === 0 ? (
          <p className="text-muted-foreground text-sm">{dict.list.empty}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagedSpots.map((spot) => (
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
    </div>
  );
}
