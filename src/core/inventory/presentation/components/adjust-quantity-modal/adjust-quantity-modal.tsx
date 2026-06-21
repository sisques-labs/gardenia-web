'use client';

import { useAdjustQuantityForm } from '@/core/inventory/presentation/hooks/use-adjust-quantity-form/use-adjust-quantity-form.hook';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import { Button } from '@/shared/presentation/components/ui/button/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/components/ui/dialog/dialog';
import { Input } from '@/shared/presentation/components/ui/input/input';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['inventory'];
  item: InventoryItem;
  onClose: () => void;
};

export function AdjustQuantityModal({ dict, item, onClose }: Props) {
  const { form, isPending, onSubmit } = useAdjustQuantityForm({ item, onClose });

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-sm gap-4">
        <DialogHeader>
          <DialogTitle className="text-ink">{dict.adjust.title}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {dict.adjust.currentQuantity}: {item.quantity} {dict.units[item.unit]}
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-ink-2">{dict.adjust.delta}</label>
            <Input type="number" step="any" {...register('delta')} />
            {errors.delta && (
              <span className="text-destructive text-xs">{errors.delta.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-ink-2">{dict.adjust.reason}</label>
            <Input {...register('reason')} />
            {errors.reason && (
              <span className="text-destructive text-xs">{errors.reason.message}</span>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              {dict.adjust.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? dict.adjust.submitting : dict.adjust.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
