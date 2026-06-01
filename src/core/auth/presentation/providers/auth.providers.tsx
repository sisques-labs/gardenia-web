'use client';

import { useBootAuth } from '@/core/auth/presentation/hooks/use-boot-auth';

export function AuthProviders({ children }: { children: React.ReactNode }) {
  useBootAuth();
  return <>{children}</>;
}
