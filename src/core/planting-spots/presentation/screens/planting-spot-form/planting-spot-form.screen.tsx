'use client';

import { Controller } from 'react-hook-form';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Input } from '@/shared/presentation/components/ui/input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select/select';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { ConfirmModal } from '@/shared/presentation/components/ui/dialog/dialog';
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

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = form;

  const formDict = dict.form;
  const typesDict = dict.types;

  const capacityValue = watch('capacity');
  const rowValue = watch('row');
  const columnValue = watch('column');
  const dimensionsWidthValue = watch('dimensionsWidth');
  const dimensionsHeightValue = watch('dimensionsHeight');
  const dimensionsLengthValue = watch('dimensionsLength');

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

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">{formDict.name}</label>
              <Input {...register('name')} />
              {errors.name && (
                <span className="text-destructive text-xs">{errors.name.message}</span>
              )}
            </div>

            {/* Type */}
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

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">{formDict.description}</label>
              <textarea
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Capacity */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">{formDict.capacity}</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setValue('capacity', Math.max(1, (capacityValue ?? 1) - 1))}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-input bg-transparent text-sm hover:bg-accent"
                  disabled={!capacityValue || capacityValue <= 1}
                >
                  −
                </button>
                <Input
                  type="number"
                  min={1}
                  className="w-20 text-center"
                  value={capacityValue ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                    setValue('capacity', v && v >= 1 ? v : null);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setValue('capacity', (capacityValue ?? 0) + 1)}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-input bg-transparent text-sm hover:bg-accent"
                >
                  +
                </button>
                {capacityValue && (
                  <button
                    type="button"
                    onClick={() => setValue('capacity', null)}
                    className="text-xs text-muted-foreground underline"
                  >
                    {formDict.capacityHint.split(' ').slice(0, 2).join(' ')}
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{formDict.capacityHint}</p>
              {errors.capacity && (
                <span className="text-destructive text-xs">{errors.capacity.message}</span>
              )}
            </div>

            {/* Grid position: row + column */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground">{formDict.row}</label>
                <Input
                  type="number"
                  min={1}
                  value={rowValue ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                    setValue('row', v && v >= 1 ? v : null);
                  }}
                />
                {errors.row && (
                  <span className="text-destructive text-xs">{errors.row.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground">{formDict.column}</label>
                <Input
                  type="number"
                  min={1}
                  value={columnValue ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? null : parseInt(e.target.value, 10);
                    setValue('column', v && v >= 1 ? v : null);
                  }}
                />
                {errors.column && (
                  <span className="text-destructive text-xs">{errors.column.message}</span>
                )}
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground">{formDict.dimensionsWidth}</label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={dimensionsWidthValue ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? null : parseFloat(e.target.value);
                    setValue('dimensionsWidth', v != null && !isNaN(v) ? v : null);
                  }}
                />
                {errors.dimensionsWidth && (
                  <span className="text-destructive text-xs">{errors.dimensionsWidth.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground">{formDict.dimensionsHeight}</label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={dimensionsHeightValue ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? null : parseFloat(e.target.value);
                    setValue('dimensionsHeight', v != null && !isNaN(v) ? v : null);
                  }}
                />
                {errors.dimensionsHeight && (
                  <span className="text-destructive text-xs">{errors.dimensionsHeight.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm text-muted-foreground">{formDict.dimensionsLength}</label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={dimensionsLengthValue ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? null : parseFloat(e.target.value);
                    setValue('dimensionsLength', v != null && !isNaN(v) ? v : null);
                  }}
                />
                {errors.dimensionsLength && (
                  <span className="text-destructive text-xs">{errors.dimensionsLength.message}</span>
                )}
              </div>
            </div>

            {/* Soil type */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">{formDict.soilType}</label>
              <Input {...register('soilType')} placeholder="e.g. Loamy, Sandy…" />
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
