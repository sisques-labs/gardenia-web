import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import { Chip } from '@/shared/presentation/components/ui/chip/chip';
import { StatusDot, type StatusDotStatus } from '@/shared/presentation/components/ui/status-dot/status-dot';
import { Button } from '@/shared/presentation/components/ui/button/button';

type Props = {
  plant: Plant;
  lang: string;
  noSpecies: string;
  /** Optional plant health/status for the StatusDot indicator */
  status?: StatusDotStatus;
  /** Optional category tag for the Chip badge */
  tag?: string;
  /** Called when the user confirms deletion */
  onDelete?: (plant: Plant) => void;
};

export function PlantCard({ plant, lang, noSpecies, status, tag, onDelete }: Props) {
  return (
    <Link
      href={`/${lang}/plants/${plant.id}`}
      className="card flex flex-col hover:shadow-md transition-shadow overflow-hidden"
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
            {plant.species?.scientificName ?? noSpecies}
          </p>
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            data-testid="btn-delete-plant"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(plant);
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2 border-t border-[var(--rule)] pt-2.5">
        {/* Category chip */}
        <div className="flex items-center gap-1.5">
          {tag ? (
            <Chip variant="forest">{tag}</Chip>
          ) : (
            <>
              <div className="h-4 w-14 rounded-full bg-muted" />
              <div className="h-4 w-16 rounded-full bg-muted" />
            </>
          )}
        </div>
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {status ? (
            <StatusDot status={status} />
          ) : (
            <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
          )}
        </div>
      </div>
    </Link>
  );
}
