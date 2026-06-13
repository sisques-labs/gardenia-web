'use client';

import { HarvestRow } from '@/core/harvests/presentation/components/harvest-row/harvest-row';
import { useHarvests } from '@/core/harvests/presentation/hooks/use-harvests/use-harvests.hook';
import { useDeleteHarvest } from '@/core/harvests/presentation/hooks/use-delete-harvest/use-delete-harvest.hook';
import { PageHeader } from '@/shared/presentation/components/page-header/page-header';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shimmer = 'bg-muted rounded animate-pulse';

function HarvestRowSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className={`h-4 w-1/3 ${shimmer}`} />
          <div className={`h-3 w-1/4 ${shimmer}`} />
          <div className={`h-3 w-1/4 ${shimmer}`} />
        </div>
        <div className={`h-8 w-16 ${shimmer}`} />
      </div>
    </div>
  );
}

type Props = {
  dict: AppDict['harvests'];
  lang: string;
};

export function HarvestsListScreen({ dict, lang: _lang }: Props) {
  const { harvests, isLoading } = useHarvests();
  const { mutate: deleteHarvest } = useDeleteHarvest();

  return (
    <div>
      <PageHeader title={dict.list.title} />

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <HarvestRowSkeleton key={i} />
            ))}
          </div>
        ) : harvests.length === 0 ? (
          <p className="text-muted-foreground text-sm">{dict.list.empty}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {harvests.map((harvest) => (
              <HarvestRow
                key={harvest.id}
                harvest={harvest}
                onDelete={(id) => deleteHarvest(id)}
                dict={dict}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
