'use client';

import { useBootAuth } from '@/core/auth/presentation/hooks/use-boot-auth/useBootAuth.hook';

export function AuthProviders({ children }: { children: React.ReactNode }) {
  useBootAuth();
  return <>{children}</>;
}
