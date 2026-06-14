'use client';

import {
  Droplets,
  Sprout,
  Scissors,
  Shovel,
  ArrowRightLeft,
  Bug,
  CloudRain,
  RotateCw,
  MoreHorizontal,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { LastCareByType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { CareLogDict } from '@/core/care-log/presentation/i18n/en';
import type { WidenStringLiterals } from '@/shared/presentation/i18n/widen-literals';

const ACTIVITY_ICONS: Record<CareLogActivityType, ReactElement> = {
  [CareLogActivityType.WATERING]: <Droplets className="w-4 h-4" />,
  [CareLogActivityType.FERTILIZING]: <Sprout className="w-4 h-4" />,
  [CareLogActivityType.PRUNING]: <Scissors className="w-4 h-4" />,
  [CareLogActivityType.REPOTTING]: <Shovel className="w-4 h-4" />,
  [CareLogActivityType.TRANSPLANTING]: <ArrowRightLeft className="w-4 h-4" />,
  [CareLogActivityType.PEST_TREATMENT]: <Bug className="w-4 h-4" />,
  [CareLogActivityType.MISTING]: <CloudRain className="w-4 h-4" />,
  [CareLogActivityType.ROTATION]: <RotateCw className="w-4 h-4" />,
  [CareLogActivityType.OTHER]: <MoreHorizontal className="w-4 h-4" />,
};

function formatRelativeTime(isoDate: string, locale: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  const diffSecs = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diffSecs);
  if (abs < 60) return rtf.format(diffSecs, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSecs / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSecs / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.round(diffSecs / 86400), 'day');
  return rtf.format(Math.round(diffSecs / 604800), 'week');
}

type Props = {
  lastCareByType: LastCareByType;
  dict: WidenStringLiterals<CareLogDict>;
  lang: string;
};

export function CareLogSummary({ lastCareByType, dict, lang }: Props) {
  const entries = (Object.entries(lastCareByType) as [CareLogActivityType, NonNullable<LastCareByType[CareLogActivityType]>][])
    .sort((a, b) => new Date(b[1].performedAt).getTime() - new Date(a[1].performedAt).getTime());

  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow mb-1">{dict.sectionTitle}</p>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dict.empty}</p>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
          {entries.map(([type, entry]) => (
            <div key={type} className="flex items-center gap-3 px-4 py-3 bg-card">
              <span className="text-[var(--forest)]">{ACTIVITY_ICONS[type]}</span>
              <span className="text-sm font-medium flex-1">{dict.activityTypes[type]}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(entry.performedAt, lang)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
