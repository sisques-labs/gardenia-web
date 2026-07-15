const shimmer = 'bg-muted rounded animate-pulse';

export function UserProfileSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-rule px-6 py-4">
        <div className={`h-7 w-40 ${shimmer}`} />
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <div className="card flex flex-col items-center gap-4 p-6">
            <div className={`h-24 w-24 rounded-full ${shimmer}`} />
            <div className="flex flex-col items-center gap-2">
              <div className={`h-6 w-32 ${shimmer}`} />
              <div className={`h-4 w-40 ${shimmer}`} />
            </div>
          </div>

          <div className="card flex flex-col gap-5 p-6">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-full ${shimmer}`} />
              <div className="flex flex-col gap-2">
                <div className={`h-4 w-24 ${shimmer}`} />
                <div className={`h-4 w-48 ${shimmer}`} />
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className={`h-4 w-24 ${shimmer}`} />
                <div className={`h-9 w-full ${shimmer}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
