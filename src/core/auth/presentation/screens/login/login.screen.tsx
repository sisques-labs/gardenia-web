'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card';
import { useLogin } from '@/core/auth/presentation/hooks/use-login/useLogin.hook';
import { loginSchema, type LoginFormValues } from '@/core/auth/presentation/schemas/login.schema';
import type { AppDict } from '@/shared/i18n/get-dictionary';

type Props = { dict: AppDict['auth']['login'] };

export function LoginScreen({ dict }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: login, isPending, error } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: () => router.replace(searchParams.get('returnUrl') ?? '/'),
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
              <Input type="email" placeholder={dict.emailPlaceholder} {...register('email')} />
              {errors.email && <span className="text-destructive text-xs">{dict.emailInvalid}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <Input type="password" placeholder={dict.passwordPlaceholder} {...register('password')} />
              {errors.password && <span className="text-destructive text-xs">{dict.passwordMin}</span>}
            </div>
            {error && <span className="text-destructive text-xs">{dict.invalidCredentials}</span>}
            <Button type="submit" disabled={isPending}>
              {isPending ? dict.submitting : dict.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
