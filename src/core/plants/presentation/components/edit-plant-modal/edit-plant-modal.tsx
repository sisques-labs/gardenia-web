'use client';

import { useEditPlantForm } from '@/core/plants/presentation/hooks/use-edit-plant-form/use-edit-plant-form.hook';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { resolveFieldError } from '@/shared/presentation/utils/resolve-field-error';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  plant: { id: string; name: string; imageUrl?: string };
  dict: AppDict['plants']['edit'];
  onClose: () => void;
};

export function EditPlantModal({ plant, dict, onClose }: Props) {
  const { form, onSubmit, isPending, error } = useEditPlantForm(plant, onClose);
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <FormModal
      title={dict.title}
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      cancelLabel={dict.cancel}
      submitLabel={dict.submit}
      submittingLabel={dict.submitting}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-plant-name" className="text-sm text-ink-2">{dict.name}</label>
        <Input id="edit-plant-name" placeholder={dict.namePlaceholder} {...register('name')} />
        {errors.name && (
          <span className="text-destructive text-xs">
            {resolveFieldError(errors.name.message, dict)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="edit-plant-image-url" className="text-sm text-ink-2">{dict.imageUrl}</label>
        <Input id="edit-plant-image-url" placeholder={dict.imageUrlPlaceholder} {...register('imageUrl')} />
      </div>

      {error && <span className="text-destructive text-xs">{dict.error}</span>}
    </FormModal>
  );
}
