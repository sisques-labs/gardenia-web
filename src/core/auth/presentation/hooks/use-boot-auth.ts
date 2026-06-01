'use client';

import { useEffect } from 'react';
import { RefreshService } from '@/core/auth/application/use-cases/refresh/refresh.service';
import { MeService } from '@/core/auth/application/use-cases/me/me.service';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const refreshService = new RefreshService(authHttpRepository);
const meService = new MeService(authHttpRepository);

// Silently restores session from the httpOnly refresh cookie on app boot.
// Runs once per mount — if no cookie exists, fails silently (user stays logged out).
export function useBootAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (accessToken) return;
    refreshService
      .refresh()
      .then(() => meService.me())
      .catch(() => {});
  }, []);
}
