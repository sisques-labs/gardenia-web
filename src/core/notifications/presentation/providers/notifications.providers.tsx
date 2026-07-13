'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { connectNotificationsStream } from '@/core/notifications/infrastructure/realtime/notifications-sse.client';

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!spaceId) return;
    const controller = new AbortController();
    connectNotificationsStream({
      spaceId,
      getAccessToken: () => useAuthStore.getState().accessToken,
      signal: controller.signal,
      onEvent: () => {
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count', spaceId] });
        queryClient.invalidateQueries({ queryKey: ['notifications', spaceId] });
      },
    });
    return () => controller.abort();
  }, [spaceId, queryClient]);

  return <>{children}</>;
}
