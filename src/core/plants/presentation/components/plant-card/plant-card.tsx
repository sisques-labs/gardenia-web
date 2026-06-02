import Link from 'next/link';
import Image from 'next/image';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

type Props = {
  plant: Plant;
  lang: string;
  noSpecies: string;
};

export function PlantCard({ plant, lang, noSpecies }: Props) {
  return (
    <Link href={`/${lang}/plants/${plant.id}`} className="block rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
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
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{plant.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {plant.species?.name ?? noSpecies}
          </p>
        </div>
      </div>
    </Link>
  );
}
