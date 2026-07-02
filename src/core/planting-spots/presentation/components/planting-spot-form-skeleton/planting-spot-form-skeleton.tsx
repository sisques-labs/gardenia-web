const shimmer = 'bg-muted rounded animate-pulse';

export function PlantingSpotFormSkeleton() {
  return (
    <div className="px-6 py-6 flex flex-col gap-4">
      <div className={`h-5 w-1/3 ${shimmer}`} />
      <div className={`h-9 w-full ${shimmer}`} />
      <div className={`h-5 w-1/4 ${shimmer}`} />
      <div className={`h-9 w-full ${shimmer}`} />
      <div className={`h-5 w-1/3 ${shimmer}`} />
      <div className={`h-20 w-full ${shimmer}`} />
    </div>
  );
}
