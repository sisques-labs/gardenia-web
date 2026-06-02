'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForgotPassword } from '@/core/auth/presentation/hooks/use-forgot-password/useForgotPassword.hook';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/core/auth/presentation/schemas/forgot-password.schema';
import { AuthHead } from '@/core/auth/presentation/components/auth-head/auth-head';
import { AuthField } from '@/core/auth/presentation/components/auth-field/auth-field';
import { AuthSubmit } from '@/core/auth/presentation/components/auth-submit/auth-submit';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = { dict: AppDict['auth']['forgotPassword'] };

export function ForgotPasswordScreen({ dict }: Props) {
  const { mutate, isPending, isSuccess } = useForgotPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = ({ email }: ForgotPasswordFormData) => {
    mutate(email);
  };

  if (isSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AuthHead
          eyebrow={dict.eyebrow}
          title={dict.successTitle}
          sub={dict.successBody}
        />
        <Link
          href="../login"
          style={{
            fontSize: '13px',
            color: 'var(--forest)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          {dict.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <AuthHead
        eyebrow={dict.eyebrow}
        title={dict.title}
        sub={dict.sub}
      />

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AuthField
          id="email"
          label={dict.email}
          type="email"
          placeholder={dict.emailPlaceholder}
          error={errors.email?.message ? dict.emailInvalid : undefined}
          registration={register('email')}
        />

        {/* Social hint info box */}
        <p
          style={{
            fontSize: '12px',
            color: 'var(--ink-3)',
            background: 'var(--paper-2)',
            borderRadius: '8px',
            padding: '10px 12px',
            margin: 0,
            border: '1px solid oklch(0.84 0.03 70)',
          }}
        >
          {dict.socialHint}
        </p>

        <AuthSubmit
          label={dict.submit}
          loadingLabel={dict.submitting}
          isPending={isPending}
        />
      </form>

      <Link
        href="../login"
        style={{
          fontSize: '13px',
          color: 'var(--forest)',
          textDecoration: 'none',
          fontWeight: 500,
          textAlign: 'center',
        }}
      >
        {dict.backToLogin}
      </Link>
    </div>
  );
}
