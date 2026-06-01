'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card';
import { useLogin } from '@/core/auth/presentation/hooks/use-login';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: login, isPending, error } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => {
    login(data, {
      onSuccess: () => {
        const returnUrl = searchParams.get('returnUrl') ?? '/';
        router.replace(returnUrl);
      },
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
