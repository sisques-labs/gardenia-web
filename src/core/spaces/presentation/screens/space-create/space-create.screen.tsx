'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card';
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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{dict.title}</CardTitle>
        </CardHeader>
        <CardContent>
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
  );
}
