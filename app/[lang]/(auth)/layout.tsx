import type { ReactNode } from 'react';
import { AuthDesktopShell } from '@/core/auth/presentation/components/auth-desktop-shell/auth-desktop-shell';
import { AuthMobileShell } from '@/core/auth/presentation/components/auth-mobile-shell/auth-mobile-shell';
import { isLocale, DEFAULT_LOCALE } from '@/shared/presentation/i18n/locale';
import { getDictionary } from '@/shared/presentation/i18n/get-dictionary';

type Props = { children: ReactNode; params: Promise<{ lang: string }> };

export default async function AuthLayout({ children, params }: Props) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <>
      <AuthDesktopShell brandDict={dict.auth.brandPanel}>{children}</AuthDesktopShell>
      <AuthMobileShell>{children}</AuthMobileShell>
    </>
  );
}
