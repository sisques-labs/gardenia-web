const shimmer = 'bg-muted rounded animate-pulse';

export function JournalSkeleton() {
  return (
    <div className="card">
      <div className={`h-5 w-32 mb-4 ${shimmer}`} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mb-4">
          <div className={`h-3 w-24 mb-2 ${shimmer}`} />
          <div className={`h-3 w-full mb-1 ${shimmer}`} />
          <div className={`h-3 w-4/5 ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}
