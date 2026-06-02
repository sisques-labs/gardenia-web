import type { ReactNode } from 'react';

type Props = { children: ReactNode };

export function AuthMobileShell({ children }: Props) {
  return (
    <div
      className="flex lg:hidden"
      style={{
        minHeight: '100vh',
        flexDirection: 'column',
        background: 'var(--paper)',
        padding: '48px 24px 32px',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
}
