const shimmer = 'bg-muted rounded animate-pulse';

export function UserProfileSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className={`h-16 w-16 rounded-full ${shimmer}`} />
        <div className="flex flex-col gap-2">
          <div className={`h-5 w-32 ${shimmer}`} />
          <div className={`h-4 w-24 ${shimmer}`} />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className={`h-4 w-20 ${shimmer}`} />
          <div className={`h-9 w-full ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}
