'use client';

import { useState } from 'react';
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
import { resolveFieldError } from '@/shared/presentation/utils/resolve-field-error';
import { cn } from '@/shared/lib/utils';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = { dict: AppDict['auth']['login']; locale: string };

export function LoginScreen({ dict, locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: login, isPending, error } = useLogin();
  const oauthError = searchParams.get('error') === 'oauth_failed';
  const [keepSession, setKeepSession] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    login(data, {
      onSuccess: () => router.replace(searchParams.get('returnUrl') ?? `/${locale}/home`),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <AuthHead
        eyebrow={dict.eyebrow}
        title={dict.title}
      />

      <AuthSocial />

      <AuthDivider label="o" />

      {oauthError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 py-3 px-3.5 bg-[oklch(0.93_0.05_35)] border border-[oklch(0.84_0.06_35)] rounded-[9px] text-[12.5px] text-[var(--ink)] leading-[1.45]"
        >
          {dict.oauthFailed}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 py-3 px-3.5 bg-[oklch(0.93_0.05_35)] border border-[oklch(0.84_0.06_35)] rounded-[9px] text-[12.5px] text-[var(--ink)] leading-[1.45]"
        >
          {dict.invalidCredentials}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <AuthField
          id="email"
          label={dict.email}
          type="email"
          placeholder={dict.emailPlaceholder}
          error={resolveFieldError(errors.email?.message, dict)}
          registration={register('email')}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <label
              htmlFor="password"
              className="font-[var(--mono)] text-[10.5px] uppercase tracking-[0.05em] text-[var(--ink-2)]"
            >
              {dict.password}
            </label>
            <Link
              href="../forgot-password"
              className="text-xs text-[var(--forest)] no-underline"
            >
              {dict.forgotPassword}
            </Link>
          </div>
          <AuthField
            id="password"
            label=""
            type="password"
            placeholder={dict.passwordPlaceholder}
            error={resolveFieldError(errors.password?.message, dict)}
            showLabel={dict.showPassword}
            hideLabel={dict.hidePassword}
            registration={register('password')}
          />
        </div>

        <label htmlFor="keep-session" className="flex items-center gap-[9px] cursor-pointer">
          <input
            id="keep-session"
            type="checkbox"
            checked={keepSession}
            onChange={(e) => setKeepSession(e.target.checked)}
            className="sr-only"
          />
          <span className={cn('cbox', keepSession && 'done')} aria-hidden="true" />
          <span className="text-[13px] text-[var(--ink-2)]">{dict.keepSession}</span>
        </label>

        <AuthSubmit
          label={dict.submit}
          loadingLabel={dict.submitting}
          isPending={isPending}
        />
      </form>

      <p className="text-[13px] text-[var(--ink-3)] text-center m-0">
        <Link href="../register" className="text-[var(--forest)] no-underline">
          {dict.register}
        </Link>
      </p>
    </div>
  );
}
