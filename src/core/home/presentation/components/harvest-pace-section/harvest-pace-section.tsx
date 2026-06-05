import { Sprout, CalendarDays, TrendingUp } from 'lucide-react';
import { StatCard } from '@/shared/presentation/components/ui/stat-card';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['home'];
};

export function HarvestPaceSection({ dict }: Props) {
  return (
    <div className="card p-4">
      <h2 className="text-base font-semibold mb-4">{dict.sections.harvestPace.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="This week"
          value="—"
          icon={<Sprout className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="This month"
          value="—"
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="On track"
          value="—"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    </div>
  );
}
