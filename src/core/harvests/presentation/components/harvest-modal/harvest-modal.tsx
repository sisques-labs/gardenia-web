'use client';

import { useHarvestForm } from '@/core/harvests/presentation/hooks/use-harvest-form/use-harvest-form.hook';
import { HARVEST_UNITS } from '@/core/harvests/domain/types/harvest.interface';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';
import { Button } from '@/shared/presentation/components/ui/button/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/components/ui/dialog/dialog';
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
    <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-md gap-4">
        <DialogHeader>
          <DialogTitle className="text-ink">
            {isEditing ? dict.form.editTitle : dict.form.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-ink-2">{dict.form.cropType}</label>
            <Input {...register('cropType')} />
            {errors.cropType && (
              <span className="text-destructive text-xs">{errors.cropType.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-ink-2">{dict.form.quantity}</label>
            <Input type="number" step="any" {...register('quantity')} />
            {errors.quantity && (
              <span className="text-destructive text-xs">{errors.quantity.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-ink-2">{dict.form.unit}</label>
            <Select value={selectedUnit} onValueChange={setUnit}>
              <SelectTrigger>
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
            <label className="text-sm text-ink-2">{dict.form.harvestedAt}</label>
            <Input type="date" {...register('harvestedAt')} />
            {errors.harvestedAt && (
              <span className="text-destructive text-xs">{errors.harvestedAt.message}</span>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              {dict.form.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? dict.form.submitting : dict.form.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
