const shimmer = 'bg-muted rounded animate-pulse';

export function TodayTasksSkeleton() {
  return (
    <div>
      <div className={`h-5 w-32 mb-4 ${shimmer}`} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className={`h-4 w-4 rounded-full ${shimmer}`} />
          <div className="flex-1 flex flex-col gap-1">
            <div className={`h-3 w-full ${shimmer}`} />
            <div className={`h-3 w-2/3 ${shimmer}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
