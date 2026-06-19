'use client';

import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Card, CardContent } from '@/shared/presentation/components/ui/card/card';
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
import type { UpdateGeolocationFormValues } from '@/core/spaces/presentation/schemas/update-geolocation.schema';

interface SpaceGeolocationCardProps {
  dict: AppDict['spaces']['settings'];
  geoForm: UseFormReturn<UpdateGeolocationFormValues>;
  onSubmit: (values: UpdateGeolocationFormValues) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export function SpaceGeolocationCard({
  dict,
  geoForm,
  onSubmit,
  isPending,
  isError,
  isSuccess,
}: SpaceGeolocationCardProps) {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4">
        <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {dict.geolocation.title}
        </p>
        <p className="text-sm text-muted-foreground">{dict.geolocation.hint}</p>
        <form onSubmit={geoForm.handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">
                {dict.geolocation.latitudeLabel}
              </label>
              <Input
                type="number"
                step="any"
                placeholder={dict.geolocation.latitudePlaceholder}
                data-testid="geolocation-latitude-input"
                {...geoForm.register('latitude', {
                  setValueAs: (v) => (v === '' || v == null ? null : parseFloat(v as string)),
                })}
              />
              {geoForm.formState.errors.latitude && (
                <span className="text-destructive text-xs">
                  {geoForm.formState.errors.latitude.message}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-muted-foreground">
                {dict.geolocation.longitudeLabel}
              </label>
              <Input
                type="number"
                step="any"
                placeholder={dict.geolocation.longitudePlaceholder}
                data-testid="geolocation-longitude-input"
                {...geoForm.register('longitude', {
                  setValueAs: (v) => (v === '' || v == null ? null : parseFloat(v as string)),
                })}
              />
              {geoForm.formState.errors.longitude && (
                <span className="text-destructive text-xs">
                  {geoForm.formState.errors.longitude.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">
              {dict.geolocation.environmentLabel}
            </label>
            <Select
              value={geoForm.watch('environment') ?? ''}
              onValueChange={(v) =>
                geoForm.setValue(
                  'environment',
                  v === '' ? null : (v as 'INDOOR' | 'OUTDOOR' | 'MIXED'),
                )
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
          </div>
          {isError && <Alert variant="error" message={dict.geolocation.saveError} />}
          {isSuccess && <Alert variant="success" message={dict.geolocation.saveSuccess} />}
          <Button type="submit" disabled={isPending} data-testid="geolocation-save-submit">
            {isPending ? dict.geolocation.saving : dict.geolocation.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
