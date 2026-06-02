import type { ReactNode } from 'react';
import { AuthBrandPanel } from '@/core/auth/presentation/components/auth-brand-panel/auth-brand-panel';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = { children: ReactNode; brandDict: AppDict['auth']['brandPanel'] };

export function AuthDesktopShell({ children, brandDict }: Props) {
  return (
    <div className="hidden lg:flex" style={{ width: '100%', minHeight: '100vh' }}>
      <AuthBrandPanel dict={brandDict} />
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 56px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
