const shimmer = 'bg-muted rounded animate-pulse';

export function NodesListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card flex items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-2 flex-1">
            <div className={`h-4 w-1/3 ${shimmer}`} />
            <div className={`h-3 w-1/4 ${shimmer}`} />
          </div>
          <div className={`h-5 w-16 rounded-full ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}
