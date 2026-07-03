import { RowSkeleton } from '@/shared/presentation/components/ui/row-skeleton/row-skeleton';

export function InventoryListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}
