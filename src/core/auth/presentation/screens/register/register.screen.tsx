'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card';
import { useRegister } from '@/core/auth/presentation/hooks/use-register/useRegister.hook';
import { registerSchema, type RegisterFormValues } from '@/core/auth/presentation/schemas/register.schema';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = { dict: AppDict['auth']['register'] };

export function RegisterScreen({ dict }: Props) {
  const router = useRouter();
  const { mutate: register, isPending, error } = useRegister();

  const { register: field, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = ({ email, password }: RegisterFormValues) => {
    register({ email, password }, {
      onSuccess: ({ spaceId }) => {
        router.replace(spaceId ? '/' : '/spaces/new');
      },
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
              <Input type="email" placeholder={dict.emailPlaceholder} {...field('email')} />
              {errors.email && <span className="text-destructive text-xs">{dict.emailInvalid}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <Input type="password" placeholder={dict.passwordPlaceholder} {...field('password')} />
              {errors.password && <span className="text-destructive text-xs">{dict.passwordMin}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <Input type="password" placeholder={dict.confirmPasswordPlaceholder} {...field('confirmPassword')} />
              {errors.confirmPassword && <span className="text-destructive text-xs">{dict.passwordsMismatch}</span>}
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
