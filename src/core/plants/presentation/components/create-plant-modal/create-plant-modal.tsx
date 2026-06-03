'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { useCreatePlant } from '@/core/plants/presentation/hooks/use-create-plant/use-create-plant.hook';
import { createPlantSchema, type CreatePlantFormValues } from '@/core/plants/presentation/schemas/create-plant.schema';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  spaceId: string | null;
  dict: AppDict['plants']['create'];
  onClose: () => void;
};

export function CreatePlantModal({ spaceId, dict, onClose }: Props) {
  const { mutate: createPlant, isPending, error } = useCreatePlant(spaceId);

  const { register, handleSubmit, formState: { errors } } = useForm<CreatePlantFormValues>({
    resolver: zodResolver(createPlantSchema),
  });

  const onSubmit = ({ name, imageUrl }: CreatePlantFormValues) => {
    createPlant(
      { name, imageUrl: imageUrl || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-background border border-[var(--rule)] rounded-xl shadow-lg w-full max-w-md mx-4 p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">{dict.title}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--ink)]/70">{dict.name}</label>
            <Input placeholder={dict.namePlaceholder} {...register('name')} />
            {errors.name && (
              <span className="text-destructive text-xs">
                {errors.name.message === 'nameRequired' ? dict.nameRequired : dict.nameMax}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-[var(--ink)]/70">{dict.imageUrl}</label>
            <Input placeholder={dict.imageUrlPlaceholder} {...register('imageUrl')} />
          </div>

          {error && <span className="text-destructive text-xs">{dict.error}</span>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              {dict.cancel}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? dict.submitting : dict.submit}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
