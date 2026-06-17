'use client';

import { useCreatePlantForm } from '@/core/plants/presentation/hooks/use-create-plant-form/use-create-plant-form.hook';
import { Button } from '@/shared/presentation/components/ui/button/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/components/ui/dialog/dialog';
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
    <Dialog open onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-md gap-4">
        <DialogHeader>
          <DialogTitle className="text-ink">{dict.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-ink-2">{dict.name}</label>
            <Input placeholder={dict.namePlaceholder} {...register('name')} />
            {errors.name && (
              <span className="text-destructive text-xs">
                {resolveFieldError(errors.name.message, dict)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-ink-2">{dict.imageUrl}</label>
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
      </DialogContent>
    </Dialog>
  );
}
