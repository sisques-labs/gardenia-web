'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  careScheduleSchema,
  type CareScheduleFormValues,
} from '@/core/care-schedule/presentation/schemas/care-schedule.schema';
import { useCreateCareSchedule } from '@/core/care-schedule/presentation/hooks/use-create-care-schedule/use-create-care-schedule.hook';
import { useUpdateCareSchedule } from '@/core/care-schedule/presentation/hooks/use-update-care-schedule/use-update-care-schedule.hook';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

type UseCareScheduleFormOptions = {
  careSchedule?: CareSchedule;
  lockedPlantId?: string;
  onClose: () => void;
};

export function useCareScheduleForm({ careSchedule, lockedPlantId, onClose }: UseCareScheduleFormOptions) {
  const isEditing = !!careSchedule;

  const { mutate: createCareSchedule, isPending: isCreating } = useCreateCareSchedule();
  const { mutate: updateCareSchedule, isPending: isUpdating } = useUpdateCareSchedule();

  const isPending = isCreating || isUpdating;

  const form = useForm<CareScheduleFormValues>({
    resolver: zodResolver(careScheduleSchema) as Resolver<CareScheduleFormValues>,
    defaultValues: careSchedule
      ? {
          plantId: careSchedule.plantId,
          activityType: careSchedule.activityType,
          isRecurring: careSchedule.intervalDays !== null,
          intervalDays: careSchedule.intervalDays ?? undefined,
          quantity: careSchedule.quantity ?? undefined,
          unit: careSchedule.unit ?? undefined,
          notes: careSchedule.notes ?? undefined,
        }
      : {
          plantId: lockedPlantId ?? '',
          activityType: 'WATERING' as const,
          isRecurring: true,
          intervalDays: 7,
        },
  });

  const { handleSubmit, watch, setValue } = form;

  const isRecurring = watch('isRecurring');
  const activityType = watch('activityType');
  const unit = watch('unit');
  const plantId = watch('plantId');

  const onSubmit = handleSubmit((values) => {
    const intervalDays = values.isRecurring ? (values.intervalDays ?? null) : null;

    if (isEditing) {
      updateCareSchedule(
        {
          id: careSchedule.id,
          activityType: values.activityType,
          intervalDays,
          quantity: values.quantity ?? null,
          unit: values.unit ?? null,
          notes: values.notes ?? null,
        },
        { onSuccess: onClose },
      );
    } else {
      createCareSchedule(
        {
          plantId: values.plantId,
          activityType: values.activityType,
          intervalDays,
          quantity: values.quantity,
          unit: values.unit,
          notes: values.notes,
        },
        { onSuccess: onClose },
      );
    }
  });

  return {
    form,
    isPending,
    onSubmit,
    isRecurring,
    activityType,
    unit,
    plantId,
    setActivityType: (val: CareScheduleFormValues['activityType']) => setValue('activityType', val),
    setUnit: (val: CareScheduleFormValues['unit']) => setValue('unit', val),
    setPlantId: (val: string) => setValue('plantId', val),
    setIsRecurring: (val: boolean) => setValue('isRecurring', val),
  };
}
