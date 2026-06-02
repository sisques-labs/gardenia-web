'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { Card, CardContent } from '@/shared/presentation/components/ui/card';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { useCreateSpace } from '@/core/spaces/presentation/hooks/use-create-space/useCreateSpace.hook';
import { createSpaceSchema, type CreateSpaceFormValues } from '@/core/spaces/presentation/schemas/create-space.schema';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['spaces']['create'];
  lang: string;
};

export function SpaceCreateScreen({ dict, lang }: Props) {
  const router = useRouter();
  const { mutate: createSpace, isPending, error } = useCreateSpace();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateSpaceFormValues>({
    resolver: zodResolver(createSpaceSchema),
  });

  const onSubmit = ({ name }: CreateSpaceFormValues) => {
    createSpace(name, {
      onSuccess: () => router.replace(`/${lang}/spaces`),
    });
  };

  return (
    <div className="p-6">
      <ScreenHeader title="New Space" />

      <div className="mt-6 max-w-sm">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Input placeholder={dict.namePlaceholder} {...register('name')} />
                {errors.name && (
                  <span className="text-destructive text-xs">
                    {errors.name.message === 'nameMin' ? dict.nameMin : dict.nameMax}
                  </span>
                )}
              </div>
              {error && <span className="text-destructive text-xs">{dict.error}</span>}
              <Button type="submit" disabled={isPending}>
                {isPending ? dict.submitting : dict.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
