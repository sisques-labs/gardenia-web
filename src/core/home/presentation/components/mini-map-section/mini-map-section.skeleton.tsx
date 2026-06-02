const shimmer = 'bg-muted rounded animate-pulse';

export function MiniMapSkeleton() {
  return (
    <div className="card">
      <div className={`h-5 w-32 mb-4 ${shimmer}`} />
      <div className={`h-48 w-full ${shimmer}`} />
    </div>
  );
}
