'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { PlantingSpotCard } from '@/core/planting-spots/presentation/components/planting-spot-card/planting-spot-card';
import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { buttonVariants } from '@/shared/presentation/components/ui/button/button';
import { Pagination } from '@/shared/presentation/components/ui/pagination/pagination';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const PAGE_SIZE = 12;

const shimmer = 'bg-muted rounded animate-pulse';

function PlantingSpotsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4 flex flex-col gap-3">
          <div className={`h-5 w-2/3 ${shimmer}`} />
          <div className={`h-4 w-1/3 ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}

type Props = {
  dict: AppDict['plantingSpots'];
  lang: string;
};

export function PlantingSpotsListScreen({ dict, lang }: Props) {
  const { spots, isLoading } = usePlantingSpots();

  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? 1));

  const handlePageChange = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(p));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const totalPages = Math.max(1, Math.ceil(spots.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedSpots = spots.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
