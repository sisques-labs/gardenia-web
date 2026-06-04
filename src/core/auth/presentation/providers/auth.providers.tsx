'use client';

import { useBootAuth } from '@/core/auth/presentation/hooks/use-boot-auth/useBootAuth.hook';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

export function AuthProviders({ children }: { children: React.ReactNode }) {
  useBootAuth();
  const isBootComplete = useAuthStore((s) => s.isBootComplete);

  if (!isBootComplete) return null;

  return <>{children}</>;
}
