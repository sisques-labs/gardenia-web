import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import { PlantingSpotFormFields } from './planting-spot-form-fields';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';
import type { PlantingSpotFormValues } from '@/core/planting-spots/presentation/schemas/planting-spot.schema';

const dict = getDictionary('es').plantingSpots;

function Harness() {
  const { register, control, setValue, watch, formState: { errors } } = useForm<PlantingSpotFormValues>({
    defaultValues: {
      name: '',
      type: 'RAISED_BED',
      description: '',
      capacity: null,
      row: null,
      column: null,
      dimensionsWidth: null,
      dimensionsHeight: null,
      dimensionsLength: null,
      soilType: '',
    },
  });

  return (
    <div className="max-w-lg flex flex-col gap-4 p-6">
      <PlantingSpotFormFields
        register={register}
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        formDict={dict.form}
        typesDict={dict.types}
      />
    </div>
  );
}

const meta = {
  title: 'PlantingSpots/PlantingSpotFormFields',
  component: Harness,
  tags: ['autodocs'],
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
