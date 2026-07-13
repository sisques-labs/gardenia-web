import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';

const mockConnect = vi.hoisted(() => vi.fn());

vi.mock('@/core/notifications/infrastructure/realtime/notifications-sse.client', () => ({
  connectNotificationsStream: mockConnect,
}));

import { NotificationsProvider } from './notifications.providers';

function renderProvider(queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <p>content</p>
      </NotificationsProvider>
    </QueryClientProvider>,
  );
}

describe('NotificationsProvider', () => {
  beforeEach(() => {
    mockConnect.mockClear();
    useSpacesStore.setState({ currentSpaceId: null });
    useAuthStore.setState({ accessToken: 'token-abc' });
  });

  it('renders children', () => {
    const { getByText } = renderProvider(new QueryClient());
    expect(getByText('content')).toBeInTheDocument();
  });

  it('does not connect when spaceId is null', () => {
    renderProvider(new QueryClient());
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('connects on mount when spaceId is present', () => {
    useSpacesStore.setState({ currentSpaceId: 'space-1' });

    renderProvider(new QueryClient());

    expect(mockConnect).toHaveBeenCalledTimes(1);
    const params = mockConnect.mock.calls[0][0];
    expect(params.spaceId).toBe('space-1');
    expect(params.getAccessToken()).toBe('token-abc');
    expect(params.signal).toBeInstanceOf(AbortSignal);
  });

  it('invalidates notifications and unread-count queries for the current space on an event', () => {
    useSpacesStore.setState({ currentSpaceId: 'space-1' });
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderProvider(queryClient);

    const params = mockConnect.mock.calls[0][0];
    params.onEvent({ type: 'notification-created', notificationId: 'notif-1' });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications-unread-count', 'space-1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['notifications', 'space-1'] });
  });

  it('aborts the connection when spaceId changes', () => {
    useSpacesStore.setState({ currentSpaceId: 'space-1' });
    const queryClient = new QueryClient();

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>
          <p>content</p>
        </NotificationsProvider>
      </QueryClientProvider>,
    );

    const firstSignal: AbortSignal = mockConnect.mock.calls[0][0].signal;
    expect(firstSignal.aborted).toBe(false);

    useSpacesStore.setState({ currentSpaceId: 'space-2' });
    rerender(
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>
          <p>content</p>
        </NotificationsProvider>
      </QueryClientProvider>,
    );

    expect(firstSignal.aborted).toBe(true);
    expect(mockConnect).toHaveBeenCalledTimes(2);
    expect(mockConnect.mock.calls[1][0].spaceId).toBe('space-2');
  });

  it('aborts the connection on unmount', () => {
    useSpacesStore.setState({ currentSpaceId: 'space-1' });
    const queryClient = new QueryClient();

    const { unmount } = renderProvider(queryClient);
    const signal: AbortSignal = mockConnect.mock.calls[0][0].signal;

    unmount();

    expect(signal.aborted).toBe(true);
  });
});
