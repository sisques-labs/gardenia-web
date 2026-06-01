'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/presentation/components/ui/button';
import { Input } from '@/shared/presentation/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/presentation/components/ui/card';
import { useRegister } from '@/core/auth/presentation/hooks/use-register/useRegister.hook';
import { registerSchema, type RegisterFormValues } from '@/core/auth/presentation/schemas/register.schema';

export function RegisterScreen() {
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
          <CardTitle>Crear cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Input type="email" placeholder="Email" {...field('email')} />
              {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <Input type="password" placeholder="Contraseña" {...field('password')} />
              {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <Input type="password" placeholder="Confirmar contraseña" {...field('confirmPassword')} />
              {errors.confirmPassword && <span className="text-destructive text-xs">{errors.confirmPassword.message}</span>}
            </div>
            {error && <span className="text-destructive text-xs">Error al crear la cuenta</span>}
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
