'use client';

import { useEffect } from 'react';
import { MeUseCase } from '@/core/auth/application/use-cases/me/me.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';
import { doRefresh } from '@/shared/infrastructure/http/axios.client';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const meService = new MeUseCase(authHttpRepository);

// Silently restores session from the httpOnly refresh cookie on app boot.
// Uses the same refreshTokenOnce mutex as onErrorLink — prevents concurrent
// HTTP calls when React StrictMode double-fires effects in development.
// Sets isBootComplete when settled so children can safely fire GQL queries.
export function useBootAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);
  const setBootComplete = useAuthStore((s) => s.setBootComplete);

  useEffect(() => {
    let cancelled = false;

    async function hydrateSession() {
      try {
        if (accessToken) {
          if (!useAuthStore.getState().currentUser) {
            const user = await meService.me();
            if (!cancelled) setCurrentUser(user);
          }
          return;
        }

        const token = await refreshTokenOnce(doRefresh);
        if (token) {
          const user = await meService.me();
          if (!cancelled) setCurrentUser(user);
        }
      } catch {
        // silent — unauthenticated users continue to public routes
      } finally {
        if (!cancelled) {
          setBootComplete();
        }
      }
    }

    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [accessToken, setCurrentUser, setBootComplete]);
}
