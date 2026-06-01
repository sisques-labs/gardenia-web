'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card';
import { useLogin } from '@/core/auth/presentation/hooks/use-login/useLogin.hook';
import { loginSchema, type LoginFormValues } from '@/core/auth/presentation/schemas/login.schema';

export function LoginScreen() {
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
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Input type="email" placeholder="Email" {...register('email')} />
              {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <Input type="password" placeholder="Contraseña" {...register('password')} />
              {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
            </div>
            {error && <span className="text-destructive text-xs">Credenciales incorrectas</span>}
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
