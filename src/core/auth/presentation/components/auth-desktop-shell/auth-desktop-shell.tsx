import type { ReactNode } from 'react';
import { AuthBrandPanel } from '@/core/auth/presentation/components/auth-brand-panel/auth-brand-panel';

type Props = { children: ReactNode };

export function AuthDesktopShell({ children }: Props) {
  return (
    <div className="hidden lg:flex" style={{ width: '100%', minHeight: '100vh' }}>
      <AuthBrandPanel />
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
