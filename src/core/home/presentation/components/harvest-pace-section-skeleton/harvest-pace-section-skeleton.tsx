const shimmer = 'bg-muted rounded animate-pulse';

export function HarvestPaceSkeleton() {
  return (
    <div className="card">
      <div className={`h-5 w-32 mb-4 ${shimmer}`} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className={`h-3 w-20 ${shimmer}`} />
          <div className={`h-2 flex-1 ${shimmer}`} />
          <div className={`h-3 w-8 ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}
