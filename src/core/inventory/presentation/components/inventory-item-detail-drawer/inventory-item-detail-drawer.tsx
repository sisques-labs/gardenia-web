'use client';

import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { Drawer } from '@/shared/presentation/components/ui/drawer/drawer';
import { formatShortDate } from '@/shared/presentation/utils/format-short-date.util';

type Props = {
  dict: AppDict['inventory'];
  lang: string;
  item: InventoryItem | null;
  onClose: () => void;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-ink-3 eyebrow">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  );
}

export function InventoryItemDetailDrawer({ dict, lang, item, onClose }: Props) {
  return (
    <Drawer open={!!item} onClose={onClose} title={item?.name ?? ''}>
      {item && (
        <div className="flex flex-col gap-4">
          <Field label={dict.form.itemType} value={dict.types[item.itemType]} />
          <Field label={dict.form.brand} value={item.brand ?? dict.detail.noValue} />
          <Field label={dict.form.quantity} value={`${item.quantity} ${dict.units[item.unit]}`} />
          <Field
            label={dict.form.lowStockThreshold}
            value={item.lowStockThreshold ?? dict.detail.noValue}
          />
          <Field
            label={dict.form.acquiredAt}
            value={item.acquiredAt ? formatShortDate(item.acquiredAt, lang) : dict.detail.noValue}
          />
          <Field
            label={dict.form.expiresAt}
            value={item.expiresAt ? formatShortDate(item.expiresAt, lang) : dict.detail.noValue}
          />
          <Field label={dict.form.notes} value={item.notes ?? dict.detail.noValue} />
          <Field label={dict.detail.createdAt} value={formatShortDate(item.createdAt, lang)} />
          <Field label={dict.detail.updatedAt} value={formatShortDate(item.updatedAt, lang)} />
        </div>
      )}
    </Drawer>
  );
}
