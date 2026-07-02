const shimmer = 'bg-muted rounded animate-pulse';

export function PlantingSpotDetailSkeleton() {
  return (
    <div className="px-6 py-6 flex flex-col gap-4">
      <div className={`h-6 w-1/3 ${shimmer}`} />
      <div className={`h-4 w-1/2 ${shimmer}`} />
      <div className={`h-40 w-full ${shimmer}`} />
    </div>
  );
}
