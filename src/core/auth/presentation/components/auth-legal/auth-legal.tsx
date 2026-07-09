import type { ReactNode } from 'react';

export type AuthLegalProps = {
  children: ReactNode;
};

export function AuthLegal({ children }: AuthLegalProps) {
  return (
    <p
      style={{
        fontSize: '12px',
        color: 'var(--ink-3)',
        textAlign: 'center',
        margin: 0,
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}
