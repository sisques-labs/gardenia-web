import type { ReactNode } from 'react';
import { AuthDesktopShell } from '@/core/auth/presentation/components/auth-desktop-shell/auth-desktop-shell';
import { AuthMobileShell } from '@/core/auth/presentation/components/auth-mobile-shell/auth-mobile-shell';

type Props = { children: ReactNode };

export default function AuthLayout({ children }: Props) {
  return (
    <>
      <AuthDesktopShell>{children}</AuthDesktopShell>
      <AuthMobileShell>{children}</AuthMobileShell>
    </>
  );
}
