'use client';

import { useHarvestForm } from '@/core/harvests/presentation/hooks/use-harvest-form/use-harvest-form.hook';
import { HARVEST_UNITS } from '@/core/harvests/domain/types/harvest.interface';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import { Input } from '@/shared/presentation/components/ui/input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select/select';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['harvests'];
  onClose: () => void;
  harvest?: Harvest;
};

export function HarvestModal({ dict, onClose, harvest }: Props) {
  const isEditing = !!harvest;

  const { form, isPending, onSubmit, selectedUnit, setUnit } = useHarvestForm({ harvest, onClose });

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
        <label htmlFor="harvest-crop-type" className="text-sm text-ink-2">{dict.form.cropType}</label>
        <Input id="harvest-crop-type" {...register('cropType')} />
        {errors.cropType && (
          <span className="text-destructive text-xs">{errors.cropType.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="harvest-quantity" className="text-sm text-ink-2">{dict.form.quantity}</label>
        <Input id="harvest-quantity" type="number" step="any" {...register('quantity')} />
        {errors.quantity && (
          <span className="text-destructive text-xs">{errors.quantity.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="harvest-unit" className="text-sm text-ink-2">{dict.form.unit}</label>
        <Select value={selectedUnit} onValueChange={setUnit}>
          <SelectTrigger id="harvest-unit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HARVEST_UNITS.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {dict.units[unit]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.unit && (
          <span className="text-destructive text-xs">{errors.unit.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="harvest-harvested-at" className="text-sm text-ink-2">{dict.form.harvestedAt}</label>
        <Input id="harvest-harvested-at" type="date" {...register('harvestedAt')} />
        {errors.harvestedAt && (
          <span className="text-destructive text-xs">{errors.harvestedAt.message}</span>
        )}
      </div>
    </FormModal>
  );
}
