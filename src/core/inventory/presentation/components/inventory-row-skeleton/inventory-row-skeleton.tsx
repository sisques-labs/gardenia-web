const shimmer = 'bg-muted rounded animate-pulse';

export function InventoryRowSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className={`h-4 w-1/3 ${shimmer}`} />
          <div className={`h-3 w-1/4 ${shimmer}`} />
          <div className={`h-3 w-1/4 ${shimmer}`} />
        </div>
        <div className={`h-8 w-16 ${shimmer}`} />
      </div>
    </div>
  );
}
