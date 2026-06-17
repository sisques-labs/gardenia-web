import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export interface PhotoGridPhoto {
  src: string;
  alt: string;
}

export interface PhotoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  photos: PhotoGridPhoto[];
  columns?: number;
  onPhotoClick?: (index: number) => void;
}

const PhotoGrid = React.forwardRef<HTMLDivElement, PhotoGridProps>(
  ({ className, photos, columns = 3, onPhotoClick, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('grid gap-2', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      {...props}
    >
      {photos.map((photo, i) => (
        <button
          key={`${photo.src}-${i}`}
          type="button"
          onClick={() => onPhotoClick?.(i)}
          className="relative overflow-hidden rounded aspect-square btn-reset"
        >
          <img
            src={photo.src}
            alt={photo.alt}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </button>
      ))}
    </div>
  ),
);
PhotoGrid.displayName = 'PhotoGrid';

export { PhotoGrid };
