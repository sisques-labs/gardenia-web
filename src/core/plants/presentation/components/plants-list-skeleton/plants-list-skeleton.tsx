const shimmer = "bg-muted rounded animate-pulse";

function PlantCardSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full ${shimmer}`} />
        <div className="flex-1 flex flex-col gap-2">
          <div className={`h-4 w-3/4 ${shimmer}`} />
          <div className={`h-3 w-1/2 ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}

export function PlantsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <PlantCardSkeleton key={i} />
      ))}
    </div>
  );
}
