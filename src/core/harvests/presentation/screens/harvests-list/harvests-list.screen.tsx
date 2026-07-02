'use client';

import { HarvestRow } from '@/core/harvests/presentation/components/harvest-row/harvest-row';
import { HarvestModal } from '@/core/harvests/presentation/components/harvest-modal/harvest-modal';
import { useHarvests } from '@/core/harvests/presentation/hooks/use-harvests/use-harvests.hook';
import { useDeleteHarvest } from '@/core/harvests/presentation/hooks/use-delete-harvest/use-delete-harvest.hook';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { RowSkeleton } from '@/shared/presentation/components/ui/row-skeleton/row-skeleton';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { useState } from 'react';

type Props = {
  dict: AppDict['harvests'];
  lang: string;
};

export function HarvestsListScreen({ dict, lang: _lang }: Props) {
  const { harvests, isLoading } = useHarvests();
  const { mutate: deleteHarvest } = useDeleteHarvest();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);

  return (
    <div>
      <ScreenHeader
        title={dict.list.title}
        actions={
          <Button size="sm" className="ml-1 bg-forest hover:bg-forest-2 text-white gap-1" onClick={() => setIsCreateOpen(true)}>
            {dict.list.newHarvest}
          </Button>
        }
      />

      <div className="px-6 py-6">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <RowSkeleton key={i} />
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
                onEdit={(h) => setEditingHarvest(h)}
                dict={dict}
              />
            ))}
          </div>
        )}
      </div>

      {isCreateOpen && (
        <HarvestModal dict={dict} onClose={() => setIsCreateOpen(false)} />
      )}
      {editingHarvest && (
        <HarvestModal dict={dict} harvest={editingHarvest} onClose={() => setEditingHarvest(null)} />
      )}
    </div>
  );
}
