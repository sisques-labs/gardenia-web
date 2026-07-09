'use client';

import { useCreatePlantForm } from '@/core/plants/presentation/hooks/use-create-plant-form/use-create-plant-form.hook';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { resolveFieldError } from '@/shared/presentation/utils/resolve-field-error';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  spaceId: string | null;
  dict: AppDict['plants']['create'];
  onClose: () => void;
};

export function CreatePlantModal({ spaceId, dict, onClose }: Props) {
  const { form, onSubmit, isPending, error } = useCreatePlantForm(spaceId, onClose);
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
        <label htmlFor="create-plant-name" className="text-sm text-ink-2">{dict.name}</label>
        <Input id="create-plant-name" placeholder={dict.namePlaceholder} {...register('name')} />
        {errors.name && (
          <span className="text-destructive text-xs">
            {resolveFieldError(errors.name.message, dict)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="create-plant-image-url" className="text-sm text-ink-2">{dict.imageUrl}</label>
        <Input id="create-plant-image-url" placeholder={dict.imageUrlPlaceholder} {...register('imageUrl')} />
      </div>

      {error && <span className="text-destructive text-xs">{dict.error}</span>}
    </FormModal>
  );
}
