'use client';

import { useCareScheduleForm } from '@/core/care-schedule/presentation/hooks/use-care-schedule-form/use-care-schedule-form.hook';
import { usePlants } from '@/core/plants/presentation/hooks/use-plants/use-plants.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { CARE_SCHEDULE_ACTIVITY_TYPES, CARE_SCHEDULE_UNITS } from '@/core/care-schedule/domain/types/care-schedule.interface';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { Checkbox } from '@/shared/presentation/components/ui/checkbox/checkbox';
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
  dict: AppDict['careSchedule'];
  onClose: () => void;
  careSchedule?: CareSchedule;
  lockedPlantId?: string;
};

export function CareScheduleModal({ dict, onClose, careSchedule, lockedPlantId }: Props) {
  const isEditing = !!careSchedule;
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const { data: plants } = usePlants(spaceId);

  const {
    form,
    isPending,
    onSubmit,
    isRecurring,
    activityType,
    unit,
    plantId,
    setActivityType,
    setUnit,
    setPlantId,
    setIsRecurring,
  } = useCareScheduleForm({ careSchedule, lockedPlantId, onClose });

  const {
    register,
    formState: { errors },
  } = form;

  const showPlantPicker = !isEditing && !lockedPlantId;

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
          {showPlantPicker && (
            <div className="flex flex-col gap-1">
              <label htmlFor="care-schedule-plant" className="text-sm text-ink-2">{dict.form.plant}</label>
              <Select value={plantId} onValueChange={setPlantId}>
                <SelectTrigger id="care-schedule-plant">
                  <SelectValue placeholder={dict.form.plantPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {(plants ?? []).map((plant) => (
                    <SelectItem key={plant.id} value={plant.id}>
                      {plant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="care-schedule-activity-type" className="text-sm text-ink-2">{dict.form.activityType}</label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger id="care-schedule-activity-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CARE_SCHEDULE_ACTIVITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {dict.row.activityTypes[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isEditing && (
            <div className="flex flex-col gap-1">
              <label htmlFor="care-schedule-next-due-at" className="text-sm text-ink-2">{dict.form.nextDueAt}</label>
              <Input id="care-schedule-next-due-at" type="date" {...register('nextDueAt')} />
              {errors.nextDueAt && (
                <span className="text-destructive text-xs">{errors.nextDueAt.message}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="care-schedule-recurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked === true)}
            />
            <label htmlFor="care-schedule-recurring" className="text-sm text-ink-2">
              {dict.form.recurring}
            </label>
          </div>

          {isRecurring && (
            <div className="flex flex-col gap-1">
              <label htmlFor="care-schedule-interval-days" className="text-sm text-ink-2">{dict.form.intervalDays}</label>
              <Input id="care-schedule-interval-days" type="number" step="1" min="1" {...register('intervalDays')} />
              {errors.intervalDays && (
                <span className="text-destructive text-xs">{errors.intervalDays.message}</span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label htmlFor="care-schedule-quantity" className="text-sm text-ink-2">{dict.form.quantity}</label>
            <Input id="care-schedule-quantity" type="number" step="any" {...register('quantity')} />
            {errors.quantity && (
              <span className="text-destructive text-xs">{errors.quantity.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="care-schedule-unit" className="text-sm text-ink-2">{dict.form.unit}</label>
            <Select value={unit} onValueChange={(value) => setUnit(value as typeof unit)}>
              <SelectTrigger id="care-schedule-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CARE_SCHEDULE_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {dict.units[u]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="care-schedule-notes" className="text-sm text-ink-2">{dict.form.notes}</label>
            <Textarea id="care-schedule-notes" {...register('notes')} />
            {errors.notes && <span className="text-destructive text-xs">{errors.notes.message}</span>}
          </div>
    </FormModal>
  );
}
