const shimmer = 'bg-muted rounded animate-pulse';

export function GrowingNowSkeleton() {
  return (
    <div className="card">
      <div className={`h-5 w-32 mb-4 ${shimmer}`} />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-20 ${shimmer}`} />
        ))}
      </div>
    </div>
  );
}
