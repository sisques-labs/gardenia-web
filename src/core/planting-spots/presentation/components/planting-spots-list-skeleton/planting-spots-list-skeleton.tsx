const shimmer = 'bg-muted rounded animate-pulse';

export function PlantingSpotsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4 flex flex-col gap-3">
          <div className={`h-5 w-2/3 ${shimmer}`} />
          <div className={`h-4 w-1/3 ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}
