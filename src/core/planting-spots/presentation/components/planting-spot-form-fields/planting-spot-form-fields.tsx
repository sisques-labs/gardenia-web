'use client';

import { Controller, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue, type UseFormWatch } from 'react-hook-form';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Input } from '@/shared/presentation/components/ui/input/input';
import { Textarea } from '@/shared/presentation/components/ui/textarea/textarea';
import { FormField } from '@/shared/presentation/components/ui/form-field/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select/select';
import { PLANTING_SPOT_TYPES, type PlantingSpotFormValues } from '@/core/planting-spots/presentation/schemas/planting-spot.schema';
import { NumberField } from '@/core/planting-spots/presentation/components/number-field/number-field';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  register: UseFormRegister<PlantingSpotFormValues>;
  control: Control<PlantingSpotFormValues>;
  errors: FieldErrors<PlantingSpotFormValues>;
  watch: UseFormWatch<PlantingSpotFormValues>;
  setValue: UseFormSetValue<PlantingSpotFormValues>;
  formDict: AppDict['plantingSpots']['form'];
  typesDict: AppDict['plantingSpots']['types'];
};

export function PlantingSpotFormFields({ register, control, errors, watch, setValue, formDict, typesDict }: Props) {
  const capacityValue = watch('capacity');
  const rowValue = watch('row');
  const columnValue = watch('column');
  const dimensionsWidthValue = watch('dimensionsWidth');
  const dimensionsHeightValue = watch('dimensionsHeight');
  const dimensionsLengthValue = watch('dimensionsLength');

  return (
    <>
      <FormField label={formDict.name} error={errors.name?.message}>
        <Input {...register('name')} />
      </FormField>

      <FormField label={formDict.type} error={errors.type?.message}>
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
      </FormField>

      <FormField label={formDict.description}>
        <Textarea {...register('description')} />
      </FormField>

      <FormField label={formDict.capacity} error={errors.capacity?.message}>
        <>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setValue('capacity', Math.max(1, (capacityValue ?? 1) - 1))}
              disabled={!capacityValue || capacityValue <= 1}
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </Button>
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
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setValue('capacity', (capacityValue ?? 0) + 1)}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </Button>
            {capacityValue && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setValue('capacity', null)}>
                {formDict.capacityHint.split(' ').slice(0, 2).join(' ')}
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{formDict.capacityHint}</p>
        </>
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label={formDict.row}
          value={rowValue}
          onChange={(v) => setValue('row', v)}
          min={1}
          error={errors.row?.message}
        />
        <NumberField
          label={formDict.column}
          value={columnValue}
          onChange={(v) => setValue('column', v)}
          min={1}
          error={errors.column?.message}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <NumberField
          label={formDict.dimensionsWidth}
          value={dimensionsWidthValue}
          onChange={(v) => setValue('dimensionsWidth', v)}
          min={0}
          integer={false}
          step="any"
          error={errors.dimensionsWidth?.message}
        />
        <NumberField
          label={formDict.dimensionsHeight}
          value={dimensionsHeightValue}
          onChange={(v) => setValue('dimensionsHeight', v)}
          min={0}
          integer={false}
          step="any"
          error={errors.dimensionsHeight?.message}
        />
        <NumberField
          label={formDict.dimensionsLength}
          value={dimensionsLengthValue}
          onChange={(v) => setValue('dimensionsLength', v)}
          min={0}
          integer={false}
          step="any"
          error={errors.dimensionsLength?.message}
        />
      </div>

      <FormField label={formDict.soilType}>
        <Input {...register('soilType')} placeholder={formDict.soilTypePlaceholder} />
      </FormField>
    </>
  );
}
