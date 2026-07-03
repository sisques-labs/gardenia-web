const shimmer = 'bg-muted rounded animate-pulse';

export function PlantDetailSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr_auto] gap-6 items-start">
        <div className={`aspect-square w-full rounded-2xl ${shimmer}`} />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className={`h-8 w-2/3 ${shimmer}`} />
            <div className={`h-4 w-1/3 ${shimmer}`} />
          </div>
          <div className="flex gap-2">
            <div className={`h-6 w-24 rounded-full ${shimmer}`} />
            <div className={`h-6 w-20 rounded-full ${shimmer}`} />
          </div>
          <div className={`h-4 w-40 ${shimmer}`} />
          <div className="flex gap-2">
            <div className={`h-8 w-32 rounded-full ${shimmer}`} />
            <div className={`h-8 w-28 rounded-full ${shimmer}`} />
          </div>
        </div>

        <div className={`h-56 w-full lg:w-56 rounded-xl ${shimmer}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`h-48 w-full rounded-xl ${shimmer}`} />
        <div className={`h-48 w-full rounded-xl ${shimmer}`} />
      </div>
    </div>
  );
}
