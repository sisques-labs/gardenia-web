'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { PlantingSpotCard } from '@/core/planting-spots/presentation/components/planting-spot-card/planting-spot-card';
import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { buttonVariants } from '@/shared/presentation/components/ui/button/button';
import { PlantingSpotsListSkeleton } from '@/core/planting-spots/presentation/components/planting-spots-list-skeleton/planting-spots-list-skeleton';
import { Pagination } from '@/shared/presentation/components/ui/pagination/pagination';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['plantingSpots'];
  lang: string;
};

export function PlantingSpotsListScreen({ dict, lang }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));

  const { spots, totalPages, currentPage, isLoading } = usePlantingSpots(page);

  const onPageChange = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(p));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

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
    </div>
  );
}
