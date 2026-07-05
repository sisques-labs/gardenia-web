const shimmer = 'bg-muted rounded animate-pulse';

export function PlantingSpotsSummarySkeleton() {
  return (
    <div>
      <div className={`h-5 w-32 mb-4 ${shimmer}`} />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`h-16 ${shimmer}`} />
        <div className={`h-16 ${shimmer}`} />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`h-6 w-20 rounded-full ${shimmer}`} />
        ))}
      </div>
    </div>
  );
}
