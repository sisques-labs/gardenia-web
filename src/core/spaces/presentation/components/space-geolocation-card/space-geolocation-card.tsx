'use client';

import { MapPin } from 'lucide-react';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Card, CardContent } from '@/shared/presentation/components/ui/card/card';
import { FormField } from '@/shared/presentation/components/ui/form-field/form-field';
import { Input } from '@/shared/presentation/components/ui/input/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select/select';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import type { UseFormReturn } from 'react-hook-form';
import type { UpdateSpaceFormValues } from '@/core/spaces/presentation/schemas/update-space.schema';

interface SpaceGeolocationCardProps {
  dict: AppDict['spaces']['settings'];
  updateSpaceForm: UseFormReturn<UpdateSpaceFormValues>;
  onSubmit: (values: UpdateSpaceFormValues) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export function SpaceGeolocationCard({
  dict,
  updateSpaceForm,
  onSubmit,
  isPending,
  isError,
  isSuccess,
}: SpaceGeolocationCardProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = updateSpaceForm;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-bg text-forest"
          >
            <MapPin className="h-5 w-5" />
          </span>
          <div className="flex min-w-0 flex-col">
            <p className="eyebrow">{dict.geolocation.title}</p>
            <p className="text-sm text-ink-3">{dict.geolocation.hint}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField label={dict.geolocation.nameLabel} error={errors.name?.message}>
            <Input
              type="text"
              placeholder={dict.geolocation.namePlaceholder}
              data-testid="geolocation-name-input"
              {...register('name')}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label={dict.geolocation.latitudeLabel}
              error={errors.latitude?.message}
            >
              <Input
                type="number"
                step="any"
                placeholder={dict.geolocation.latitudePlaceholder}
                data-testid="geolocation-latitude-input"
                {...register('latitude', {
                  setValueAs: (v) => (v === '' || v == null ? null : parseFloat(v as string)),
                })}
              />
            </FormField>
            <FormField
              label={dict.geolocation.longitudeLabel}
              error={errors.longitude?.message}
            >
              <Input
                type="number"
                step="any"
                placeholder={dict.geolocation.longitudePlaceholder}
                data-testid="geolocation-longitude-input"
                {...register('longitude', {
                  setValueAs: (v) => (v === '' || v == null ? null : parseFloat(v as string)),
                })}
              />
            </FormField>
          </div>

          <FormField label={dict.geolocation.environmentLabel}>
            <Select
              value={watch('environment') ?? ''}
              onValueChange={(v) =>
                setValue('environment', v === '' ? null : (v as 'INDOOR' | 'OUTDOOR' | 'MIXED'))
              }
            >
              <SelectTrigger data-testid="geolocation-environment-select">
                <SelectValue placeholder={dict.geolocation.environmentNone} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDOOR">{dict.geolocation.environmentIndoor}</SelectItem>
                <SelectItem value="OUTDOOR">{dict.geolocation.environmentOutdoor}</SelectItem>
                <SelectItem value="MIXED">{dict.geolocation.environmentMixed}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {isError && <Alert variant="error" message={dict.geolocation.saveError} />}
          {isSuccess && <Alert variant="success" message={dict.geolocation.saveSuccess} />}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} data-testid="geolocation-save-submit">
              {isPending ? dict.geolocation.saving : dict.geolocation.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
