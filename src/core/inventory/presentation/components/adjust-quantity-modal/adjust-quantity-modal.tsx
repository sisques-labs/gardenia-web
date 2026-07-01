'use client';

import { useAdjustQuantityForm } from '@/core/inventory/presentation/hooks/use-adjust-quantity-form/use-adjust-quantity-form.hook';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
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
    <FormModal
      title={dict.adjust.title}
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      cancelLabel={dict.adjust.cancel}
      submitLabel={dict.adjust.submit}
      submittingLabel={dict.adjust.submitting}
      maxWidth="sm"
      beforeForm={
        <p className="text-sm text-muted-foreground">
          {dict.adjust.currentQuantity}: {item.quantity} {dict.units[item.unit]}
        </p>
      }
    >
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
    </FormModal>
  );
}
