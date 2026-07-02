const shimmer = 'bg-muted rounded animate-pulse';

export function PlantDetailSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className={`h-7 w-48 ${shimmer}`} />
      </div>
      <div className={`h-48 w-full ${shimmer}`} />
      <div className={`h-5 w-32 ${shimmer}`} />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-24 w-full ${shimmer}`} />
        ))}
      </div>
    </div>
  );
}
