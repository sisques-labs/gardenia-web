'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/shared/presentation/components/ui/badge/badge';
import { usePlantIdentifications } from '@/core/plant-identification/presentation/hooks/use-plant-identifications/use-plant-identifications.hook';
import { formatShortDate } from '@/shared/presentation/utils/format-short-date.util';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  spaceId: string | null;
  lang: string;
  dict: AppDict['plantIdentification']['recent'];
};

export function RecentIdentificationsList({ spaceId, lang, dict }: Props) {
  const { data } = usePlantIdentifications(spaceId);
  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-3" data-testid="recent-identifications-list">
      <span className="text-sm font-medium text-ink-2">{dict.title}</span>
      {items.length === 0 ? (
        <p className="text-xs text-ink-3">{dict.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((identification) => {
            const thumbnail = identification.photos[0]?.url;
            const label =
              identification.status === 'resolved' && identification.resolved
                ? identification.resolved.scientificName
                : dict.noMatchLabel;

            return (
              <li
                key={identification.id}
                data-testid={`recent-identification-${identification.id}`}
                className="flex items-center gap-3 rounded-md border border-rule p-2"
              >
                {thumbnail ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                    <Image src={thumbnail} alt="" fill unoptimized sizes="40px" className="object-cover" />
                  </div>
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded bg-paper-2" aria-hidden="true" />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm italic">{label}</span>
                  <span className="text-xs text-ink-3">{formatShortDate(identification.createdAt, lang)}</span>
                </div>
                {identification.convertedToPlantId && (
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge variant="forest">{dict.convertedBadge}</Badge>
                    <Link
                      href={`/${lang}/plants/${identification.convertedToPlantId}`}
                      data-testid={`link-plant-${identification.id}`}
                      className="text-xs text-forest hover:underline"
                    >
                      {dict.viewPlant}
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
