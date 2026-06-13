'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateHarvest } from '@/core/harvests/presentation/hooks/use-create-harvest/use-create-harvest.hook';
import { useUpdateHarvest } from '@/core/harvests/presentation/hooks/use-update-harvest/use-update-harvest.hook';
import { harvestSchema, type HarvestFormValues } from '@/core/harvests/presentation/schemas/harvest.schema';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';
import { Button } from '@/shared/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/components/ui/dialog';
import { Input } from '@/shared/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['harvests'];
  onClose: () => void;
  harvest?: Harvest;
};

const UNITS = ['KG', 'G', 'PIECES', 'LITERS', 'ML', 'BUNCHES'] as const;

export function HarvestModal({ dict, onClose, harvest }: Props) {
  const isEditing = !!harvest;

  const { mutate: createHarvest, isPending: isCreating } = useCreateHarvest();
  const { mutate: updateHarvest, isPending: isUpdating } = useUpdateHarvest();

  const isPending = isCreating || isUpdating;

  const form = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestSchema) as Resolver<HarvestFormValues>,
    defaultValues: harvest
      ? {
          cropType: harvest.cropType,
          quantity: harvest.quantity,
          unit: harvest.unit,
          harvestedAt: harvest.harvestedAt,
        }
      : {
          unit: 'KG' as const,
        },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedUnit = watch('unit');

  const onSubmit = handleSubmit((values) => {
    if (isEditing) {
      updateHarvest(
        { id: harvest.id, ...values },
        { onSuccess: onClose },
      );
    } else {
      createHarvest(values, { onSuccess: onClose });
    }
  });

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
            <Select value={selectedUnit} onValueChange={(val) => setValue('unit', val as HarvestFormValues['unit'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map((unit) => (
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
