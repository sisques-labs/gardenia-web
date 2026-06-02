import Link from 'next/link';
import Image from 'next/image';
import { Sun, Droplets } from 'lucide-react';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

type Props = {
  plant: Plant;
  lang: string;
  noSpecies: string;
};

export function PlantCard({ plant, lang, noSpecies }: Props) {
  return (
    <Link
      href={`/${lang}/plants/${plant.id}`}
      className="flex flex-col rounded-lg border bg-card hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Main row */}
      <div className="flex items-center gap-3 p-4">
        {plant.imageUrl ? (
          <Image
            src={plant.imageUrl}
            alt={plant.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-lg font-semibold text-muted-foreground">
              {plant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{plant.name}</p>
          <p className="text-xs text-muted-foreground truncate italic">
            {plant.species?.name ?? noSpecies}
          </p>
        </div>
      </div>

      {/* Footer — structural slots, data pending */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2 border-t border-[var(--rule)] pt-2.5">
        {/* Category + stage placeholders */}
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-14 rounded-full bg-muted" />
          <div className="h-4 w-16 rounded-full bg-muted" />
        </div>
        {/* Sun + water placeholders */}
        <div className="flex items-center gap-2 text-muted-foreground/40">
          <Sun className="w-3.5 h-3.5" />
          <Droplets className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
