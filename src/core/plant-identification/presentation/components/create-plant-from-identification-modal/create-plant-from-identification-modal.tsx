'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePlantFromIdentification } from '@/core/plant-identification/presentation/hooks/use-create-plant-from-identification/use-create-plant-from-identification.hook';
import {
  createPlantFromIdentificationSchema,
  type CreatePlantFromIdentificationFormValues,
} from '@/core/plant-identification/presentation/schemas/create-plant-from-identification.schema';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { resolveFieldError } from '@/shared/presentation/utils/resolve-field-error';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  identification: PlantIdentification;
  dict: AppDict['plantIdentification']['createModal'];
  onClose: () => void;
  onSuccess: (plantId: string) => void;
};

export function CreatePlantFromIdentificationModal({ identification, dict, onClose, onSuccess }: Props) {
  const { mutate, isPending, error } = useCreatePlantFromIdentification();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePlantFromIdentificationFormValues>({
    resolver: zodResolver(createPlantFromIdentificationSchema),
  });

  const onSubmit = handleSubmit(({ name }) => {
    mutate(
      { identificationId: identification.id, name },
      { onSuccess: ({ id }) => onSuccess(id) },
    );
  });

  const previewUrl = identification.photos[0]?.url;

  return (
    <FormModal
      title={dict.title}
      onClose={onClose}
      onSubmit={onSubmit}
      isPending={isPending}
      cancelLabel={dict.cancel}
      submitLabel={dict.submit}
      submittingLabel={dict.submitting}
      beforeForm={
        previewUrl ? (
          <div
            className="relative h-32 w-full overflow-hidden rounded-md"
            data-testid="create-plant-from-identification-preview"
          >
            <Image src={previewUrl} alt="" fill unoptimized sizes="100vw" className="object-cover" />
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="create-plant-from-identification-name" className="text-sm text-ink-2">
          {dict.nameLabel}
        </label>
        <Input
          id="create-plant-from-identification-name"
          placeholder={dict.namePlaceholder}
          {...register('name')}
        />
        {errors.name && (
          <span className="text-destructive text-xs">
            {resolveFieldError(errors.name.message, dict)}
          </span>
        )}
      </div>

      {error && <span className="text-destructive text-xs">{dict.error}</span>}
    </FormModal>
  );
}
