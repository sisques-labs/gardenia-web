import { RowSkeleton } from '@/shared/presentation/components/ui/row-skeleton/row-skeleton';

export function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}
