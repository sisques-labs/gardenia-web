'use client';

import { useInventoryItemForm } from '@/core/inventory/presentation/hooks/use-inventory-item-form/use-inventory-item-form.hook';
import {
  INVENTORY_ITEM_TYPES,
  INVENTORY_UNITS,
} from '@/core/inventory/domain/types/inventory-item.interface';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { Textarea } from '@/shared/presentation/components/ui/textarea/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select/select';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['inventory'];
  onClose: () => void;
  item?: InventoryItem;
};

export function InventoryItemModal({ dict, onClose, item }: Props) {
  const { form, isEditing, isPending, onSubmit, selectedType, setType, selectedUnit, setUnit } =
    useInventoryItemForm({ item, onClose });

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <FormModal
      title={isEditing ? dict.form.editTitle : dict.form.title}
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      cancelLabel={dict.form.cancel}
      submitLabel={dict.form.submit}
      submittingLabel={dict.form.submitting}
    >
          <div className="flex flex-col gap-1">
            <label htmlFor="inventory-item-type" className="text-sm text-ink-2">{dict.form.itemType}</label>
            <Select value={selectedType} onValueChange={setType}>
              <SelectTrigger id="inventory-item-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_ITEM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {dict.types[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="inventory-item-name" className="text-sm text-ink-2">{dict.form.name}</label>
            <Input id="inventory-item-name" {...register('name')} />
            {errors.name && <span className="text-destructive text-xs">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="inventory-item-brand" className="text-sm text-ink-2">{dict.form.brand}</label>
            <Input id="inventory-item-brand" {...register('brand')} />
          </div>

          {!isEditing && (
            <div className="flex flex-col gap-1">
              <label htmlFor="inventory-item-quantity" className="text-sm text-ink-2">{dict.form.quantity}</label>
              <Input id="inventory-item-quantity" type="number" step="any" {...register('quantity')} />
              {errors.quantity && (
                <span className="text-destructive text-xs">{errors.quantity.message}</span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="inventory-item-unit" className="text-sm text-ink-2">{dict.form.unit}</label>
            <Select value={selectedUnit} onValueChange={setUnit}>
              <SelectTrigger id="inventory-item-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_UNITS.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {dict.units[unit]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="inventory-item-low-stock-threshold" className="text-sm text-ink-2">{dict.form.lowStockThreshold}</label>
            <Input id="inventory-item-low-stock-threshold" type="number" step="any" {...register('lowStockThreshold')} />
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="inventory-item-acquired-at" className="text-sm text-ink-2">{dict.form.acquiredAt}</label>
              <Input id="inventory-item-acquired-at" type="date" {...register('acquiredAt')} />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label htmlFor="inventory-item-expires-at" className="text-sm text-ink-2">{dict.form.expiresAt}</label>
              <Input id="inventory-item-expires-at" type="date" {...register('expiresAt')} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="inventory-item-notes" className="text-sm text-ink-2">{dict.form.notes}</label>
            <Textarea id="inventory-item-notes" rows={3} {...register('notes')} />
          </div>
    </FormModal>
  );
}
