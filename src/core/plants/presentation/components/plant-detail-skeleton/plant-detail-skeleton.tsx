const shimmer = 'bg-muted rounded animate-pulse';

export function PlantDetailSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="card rounded-3xl p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_1fr_auto] gap-8 lg:gap-10 items-start">
          <div className={`aspect-square w-full rounded-2xl ${shimmer}`} />

          <div className="flex flex-col gap-4 pt-1">
            <div className="flex flex-col gap-2">
              <div className={`h-10 w-2/3 ${shimmer}`} />
              <div className={`h-4 w-1/3 ${shimmer}`} />
              <div className={`h-4 w-1/4 ${shimmer}`} />
            </div>
            <div className="flex gap-2">
              <div className={`h-6 w-24 rounded-full ${shimmer}`} />
              <div className={`h-6 w-20 rounded-full ${shimmer}`} />
            </div>
            <div className="dashed-rule" />
            <div className="flex gap-2">
              <div className={`h-8 w-32 rounded-full ${shimmer}`} />
              <div className={`h-8 w-28 rounded-full ${shimmer}`} />
            </div>
          </div>

          <div className={`h-60 w-full lg:w-52 rounded-2xl ${shimmer}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`h-48 w-full rounded-2xl ${shimmer}`} />
        <div className={`h-48 w-full rounded-2xl ${shimmer}`} />
      </div>
    </div>
  );
}
