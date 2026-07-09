'use client';

import { useEditPlantingSpotForm } from '@/core/planting-spots/presentation/hooks/use-edit-planting-spot-form/use-edit-planting-spot-form.hook';
import { PlantingSpotFormFields } from '@/core/planting-spots/presentation/components/planting-spot-form-fields/planting-spot-form-fields';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  spot: PlantingSpot;
  dict: AppDict['plantingSpots'];
  onClose: () => void;
};

export function EditPlantingSpotModal({ spot, dict, onClose }: Props) {
  const { form, onSubmit, isPending, error } = useEditPlantingSpotForm(spot, onClose);
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const formDict = dict.form;

  return (
    <FormModal
      title={formDict.titleEdit}
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      cancelLabel={formDict.cancel}
      submitLabel={formDict.save}
      submittingLabel={formDict.saving}
    >
      <PlantingSpotFormFields
        register={register}
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        formDict={formDict}
        typesDict={dict.types}
      />
      {error && <span className="text-destructive text-xs">{formDict.error}</span>}
    </FormModal>
  );
}
