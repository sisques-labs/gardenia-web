import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { Button } from '@/shared/presentation/components/ui/button/button';

type Props = {
  dict: AppDict['inventory'];
  selectedCount: number;
  onDeleteSelected: () => void;
};

export function InventoryBulkActionsBar({ dict, selectedCount, onDeleteSelected }: Props) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-md border border-[var(--rule)] bg-[var(--paper-2)] px-4 py-2">
      <span className="text-sm text-ink-2">
        {selectedCount} {dict.bulk.selectedSuffix}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="text-[var(--terracotta)] hover:text-[var(--terracotta)]"
        onClick={onDeleteSelected}
      >
        {dict.bulk.deleteSelected}
      </Button>
    </div>
  );
}
