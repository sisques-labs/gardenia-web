'use client';

import { Controller } from 'react-hook-form';
import { useEditPlantForm } from '@/core/plants/presentation/hooks/use-edit-plant-form/use-edit-plant-form.hook';
import { SpeciesCombobox } from '@/core/plants/presentation/components/species-combobox/species-combobox';
import { FormModal } from '@/shared/presentation/components/ui/form-modal/form-modal';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { resolveFieldError } from '@/shared/presentation/utils/resolve-field-error';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import type { GbifSpeciesSuggestion } from '@/core/plants/domain/interfaces/gbif-species-suggestion.interface';

type Props = {
  plant: { id: string; name: string; imageUrl?: string; species?: GbifSpeciesSuggestion | null };
  dict: AppDict['plants']['edit'];
  onClose: () => void;
};

export function EditPlantModal({ plant, dict, onClose }: Props) {
  const { form, onSubmit, isPending, error } = useEditPlantForm(plant, onClose);
  const {
    register,
    control,
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
        <span className="text-sm text-ink-2">{dict.speciesSearch.label}</span>
        <Controller
          name="species"
          control={control}
          render={({ field }) => (
            <SpeciesCombobox
              ariaLabel={dict.speciesSearch.label}
              value={field.value ?? null}
              onChange={field.onChange}
              placeholder={dict.speciesSearch.placeholder}
              noResultsLabel={dict.speciesSearch.noResults}
              unavailableLabel={dict.speciesSearch.unavailable}
            />
          )}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="edit-plant-image-url" className="text-sm text-ink-2">{dict.imageUrl}</label>
        <Input id="edit-plant-image-url" placeholder={dict.imageUrlPlaceholder} {...register('imageUrl')} />
      </div>

      {error && <span className="text-destructive text-xs">{dict.error}</span>}
    </FormModal>
  );
}
