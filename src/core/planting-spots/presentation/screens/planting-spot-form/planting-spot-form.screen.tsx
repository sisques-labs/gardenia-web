'use client';

import { Controller } from 'react-hook-form';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { ConfirmModal } from '@/shared/presentation/components/ui/dialog';
import { PLANTING_SPOT_TYPES } from '@/core/planting-spots/presentation/schemas/planting-spot.schema';
import { usePlantingSpotForm } from '@/core/planting-spots/presentation/hooks/use-planting-spot-form/use-planting-spot-form.hook';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shimmer = 'bg-muted rounded animate-pulse';

function FormSkeleton() {
  return (
    <div className="px-6 py-6 flex flex-col gap-4">
      <div className={`h-5 w-1/3 ${shimmer}`} />
      <div className={`h-9 w-full ${shimmer}`} />
      <div className={`h-5 w-1/4 ${shimmer}`} />
      <div className={`h-9 w-full ${shimmer}`} />
      <div className={`h-5 w-1/3 ${shimmer}`} />
      <div className={`h-20 w-full ${shimmer}`} />
    </div>
  );
}

type Props = {
  dict: AppDict['plantingSpots'];
  lang: string;
  mode: 'create' | 'edit';
  spotId?: string;
};

export function PlantingSpotFormScreen({ dict, lang, mode, spotId }: Props) {
  const {
    form,
    isLoading,
    isEdit,
    isPending,
    deleteOpen,
    setDeleteOpen,
    onSubmit,
    handleDelete,
    navigateToList,
    deleteMutation,
  } = usePlantingSpotForm({ mode, spotId, lang });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const formDict = dict.form;
  const typesDict = dict.types;

  return (
    <div>
      <ScreenHeader
        title={isEdit ? formDict.titleEdit : formDict.titleCreate}
        breadcrumbs={[
          { label: dict.list.title, href: `/${lang}/planting-spots` },
          { label: isEdit ? formDict.titleEdit : formDict.titleCreate },
        ]}
      />

      {isEdit && isLoading ? (
        <FormSkeleton />
      ) : (
        <div className="px-6 py-6 max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">{formDict.name}</label>
              <Input {...register('name')} />
              {errors.name && (
                <span className="text-destructive text-xs">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">{formDict.type}</label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANTING_SPOT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {typesDict[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <span className="text-destructive text-xs">{errors.type.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">{formDict.description}</label>
              <textarea
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              {isEdit && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                  disabled={deleteMutation.isPending}
                >
                  {formDict.delete}
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={navigateToList}
                  disabled={isPending}
                >
                  {formDict.cancel}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? formDict.saving : formDict.save}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {isEdit && (
        <ConfirmModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={formDict.delete}
          description={formDict.deleteConfirm}
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
          confirmLabel={formDict.delete}
          cancelLabel={formDict.cancel}
          destructive
        />
      )}
    </div>
  );
}
