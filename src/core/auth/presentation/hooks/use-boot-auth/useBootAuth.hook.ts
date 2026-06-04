'use client';

import { useEffect } from 'react';
import { RefreshUseCase } from '@/core/auth/application/use-cases/refresh/refresh.use-case';
import { MeUseCase } from '@/core/auth/application/use-cases/me/me.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const refreshService = new RefreshUseCase(authHttpRepository);
const meService = new MeUseCase(authHttpRepository);

// Silently restores session from the httpOnly refresh cookie on app boot.
// Runs once per mount — if no cookie exists, fails silently (user stays logged out).
// Sets isBootComplete when settled so children can safely fire GQL queries.
export function useBootAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setBootComplete = useAuthStore((s) => s.setBootComplete);

  useEffect(() => {
    if (accessToken) {
      setBootComplete();
      return;
    }
    refreshService
      .refresh()
      .then(() => meService.me())
      .catch(() => {})
      .finally(() => setBootComplete());
  }, []);
}
