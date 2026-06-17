import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Chip } from './chip';

export interface PlantCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  species?: string;
  status?: string;
  imageUrl?: string;
}

const PlantCard = React.forwardRef<HTMLDivElement, PlantCardProps>(
  ({ className, name, species, status, imageUrl, ...props }, ref) => (
    <div ref={ref} className={cn('card p-4 flex flex-col gap-2', className)} {...props}>
      {imageUrl && (
        <img src={imageUrl} alt={name} className="w-full h-40 object-cover rounded" />
      )}
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-[var(--ink)]">{name}</h3>
        {species && <p className="text-xs text-[var(--ink-3)] italic">{species}</p>}
      </div>
      {status && <Chip>{status}</Chip>}
    </div>
  ),
);
PlantCard.displayName = 'PlantCard';

export { PlantCard };
