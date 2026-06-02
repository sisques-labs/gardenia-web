'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister } from '@/core/auth/presentation/hooks/use-register/useRegister.hook';
import { registerSchema, type RegisterFormValues } from '@/core/auth/presentation/schemas/register.schema';
import { AuthHead } from '@/core/auth/presentation/components/auth-head/auth-head';
import { AuthField } from '@/core/auth/presentation/components/auth-field/auth-field';
import { AuthSubmit } from '@/core/auth/presentation/components/auth-submit/auth-submit';
import { AuthSocial } from '@/core/auth/presentation/components/auth-social/auth-social';
import { AuthDivider } from '@/core/auth/presentation/components/auth-divider/auth-divider';
import { AuthLegal } from '@/core/auth/presentation/components/auth-legal/auth-legal';
import { PwStrength } from '@/core/auth/presentation/components/pw-strength/pw-strength';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = { dict: AppDict['auth']['register'] };

export function RegisterScreen({ dict }: Props) {
  const router = useRouter();
  const { mutate: register, isPending, error } = useRegister();
  const [passwordValue, setPasswordValue] = useState('');

  const { register: field, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <AuthHead
        eyebrow={dict.eyebrow}
        title={dict.title}
      />

      <AuthSocial />

      <AuthDivider label="o" />

      {error && (
        <p role="alert" style={{ fontSize: '13px', color: 'var(--terracotta)', margin: 0 }}>
          {dict.error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AuthField
          id="email"
          label={dict.email}
          type="email"
          placeholder={dict.emailPlaceholder}
          error={errors.email?.message ? dict.emailInvalid : undefined}
          registration={field('email')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor="password"
            style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-2)' }}
          >
            {dict.password}
          </label>
          <AuthField
            id="password"
            label=""
            type="password"
            placeholder={dict.passwordPlaceholder}
            error={errors.password?.message ? dict.passwordMin : undefined}
            registration={{
              ...field('password'),
              onChange: async (e) => {
                setPasswordValue(e.target.value);
                return field('password').onChange(e);
              },
            }}
          />
          <p style={{ fontSize: '12px', color: 'var(--ink-3)', margin: 0 }}>
            {dict.passwordHint}
          </p>
          <PwStrength password={passwordValue} />
        </div>

        <AuthField
          id="confirmPassword"
          label={dict.confirmPassword}
          type="password"
          placeholder={dict.confirmPasswordPlaceholder}
          error={errors.confirmPassword?.message ? dict.passwordsMismatch : undefined}
          registration={field('confirmPassword')}
        />

        <AuthSubmit
          label={dict.submit}
          loadingLabel={dict.submitting}
          isPending={isPending}
        />
      </form>

      <p style={{ fontSize: '13px', color: 'var(--ink-3)', textAlign: 'center', margin: 0 }}>
        <Link href="../login" style={{ color: 'var(--forest)', textDecoration: 'none' }}>
          {dict.login}
        </Link>
      </p>

      <AuthLegal>{dict.terms}</AuthLegal>
    </div>
  );
}
