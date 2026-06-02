'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLogin } from '@/core/auth/presentation/hooks/use-login/useLogin.hook';
import { loginSchema, type LoginFormValues } from '@/core/auth/presentation/schemas/login.schema';
import { AuthHead } from '@/core/auth/presentation/components/auth-head/auth-head';
import { AuthField } from '@/core/auth/presentation/components/auth-field/auth-field';
import { AuthSubmit } from '@/core/auth/presentation/components/auth-submit/auth-submit';
import { AuthSocial } from '@/core/auth/presentation/components/auth-social/auth-social';
import { AuthDivider } from '@/core/auth/presentation/components/auth-divider/auth-divider';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <AuthHead
        eyebrow={dict.eyebrow}
        title={dict.title}
      />

      <AuthSocial />

      <AuthDivider label="o" />

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
            background: 'oklch(0.93 0.05 35)', border: '1px solid oklch(0.84 0.06 35)', borderRadius: 9,
            fontSize: '12.5px', color: 'var(--ink)', lineHeight: 1.45,
          }}
        >
          {dict.invalidCredentials}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AuthField
          id="email"
          label={dict.email}
          type="email"
          placeholder={dict.emailPlaceholder}
          error={errors.email?.message ? dict.emailInvalid : undefined}
          registration={register('email')}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label
              htmlFor="password"
              style={{ fontFamily: 'var(--mono)', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-2)' }}
            >
              {dict.password}
            </label>
            <Link
              href="../forgot-password"
              style={{ fontSize: '11.5px', color: 'var(--forest)', textDecoration: 'none' }}
            >
              {dict.forgotPassword}
            </Link>
          </div>
          <AuthField
            id="password"
            label=""
            type="password"
            placeholder={dict.passwordPlaceholder}
            error={errors.password?.message ? dict.passwordMin : undefined}
            registration={register('password')}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
          <span className="cbox" />
          <span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{dict.keepSession}</span>
        </label>

        <AuthSubmit
          label={dict.submit}
          loadingLabel={dict.submitting}
          isPending={isPending}
        />
      </form>

      <p style={{ fontSize: '13px', color: 'var(--ink-3)', textAlign: 'center', margin: 0 }}>
        <Link href="../register" style={{ color: 'var(--forest)', textDecoration: 'none' }}>
          {dict.register}
        </Link>
      </p>
    </div>
  );
}
