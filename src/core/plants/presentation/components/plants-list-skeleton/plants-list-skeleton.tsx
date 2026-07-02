const shimmer = "bg-muted rounded animate-pulse";

function PlantCardSkeleton() {
  return (
    <div className="card overflow-hidden w-full">
      <div className={`h-36 w-full ${shimmer}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 flex flex-col gap-2">
            <div className={`h-4 w-3/4 ${shimmer}`} />
            <div className={`h-3 w-1/2 ${shimmer}`} />
          </div>
          <div className={`h-5 w-12 rounded-full ${shimmer}`} />
        </div>
        <div className={`h-px w-full my-3 ${shimmer}`} />
        <div className="flex items-center justify-between">
          <div className={`h-3 w-14 ${shimmer}`} />
          <div className={`h-3 w-16 ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}

export function PlantsListSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <PlantCardSkeleton key={i} />
      ))}
    </div>
  );
}
