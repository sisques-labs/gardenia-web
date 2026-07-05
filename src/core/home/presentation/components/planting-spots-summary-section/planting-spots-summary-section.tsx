'use client';

import { Sprout, Leaf } from 'lucide-react';
import { StatCard } from '@/shared/presentation/components/ui/stat-card/stat-card';
import { EmptyState } from '@/shared/presentation/components/ui/empty-state/empty-state';
import { Chip } from '@/shared/presentation/components/ui/chip/chip';
import { usePlantingSpotsSummary } from '@/core/home/presentation/hooks/use-planting-spots-summary/use-planting-spots-summary.hook';
import { PlantingSpotsSummarySkeleton } from '@/core/home/presentation/components/planting-spots-summary-section-skeleton/planting-spots-summary-section-skeleton';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['home'];
  plantingSpotsDict: AppDict['plantingSpots'];
};

export function PlantingSpotsSummarySection({ dict, plantingSpotsDict }: Props) {
  const { spots, isLoading, activeCount, fallowCount, countByType } = usePlantingSpotsSummary();

  if (isLoading) return <PlantingSpotsSummarySkeleton />;

  if (spots.length === 0) {
    return (
      <div>
        <h2 className="text-base font-semibold mb-4 pb-3 border-b border-[var(--rule)]">{dict.sections.plantingSpotsSummary.title}</h2>
        <EmptyState title={dict.sections.plantingSpotsSummary.empty} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-semibold mb-4 pb-3 border-b border-[var(--rule)]">{dict.sections.plantingSpotsSummary.title}</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          label={dict.sections.plantingSpotsSummary.active}
          value={activeCount}
          icon={<Sprout className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label={dict.sections.plantingSpotsSummary.fallow}
          value={fallowCount}
          icon={<Leaf className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(countByType).map(([type, count]) => (
          <Chip key={type}>
            {plantingSpotsDict.types[type as keyof typeof plantingSpotsDict.types]} · {count}
          </Chip>
        ))}
      </div>
    </div>
  );
}
