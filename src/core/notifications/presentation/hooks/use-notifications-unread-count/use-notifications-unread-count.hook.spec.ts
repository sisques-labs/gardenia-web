import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/notifications/application/use-cases/get-notifications-unread-count/get-notifications-unread-count.use-case',
  () => ({
    GetNotificationsUnreadCountUseCase: class {
      execute = mockExecute;
    },
  }),
);

vi.mock('@/core/notifications/infrastructure/repositories/graphql/notification.gql.repository', () => ({
  notificationGqlRepository: {},
}));

const mockSpaceId = vi.hoisted(() => ({ value: 'space-1' as string | null }));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: (selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: mockSpaceId.value }),
}));

import { useNotificationsUnreadCount } from './use-notifications-unread-count.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useNotificationsUnreadCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpaceId.value = 'space-1';
  });

  it('returns the unread count on success', async () => {
    mockExecute.mockResolvedValue(4);

    const { result } = renderHook(() => useNotificationsUnreadCount(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.unreadCount).toBe(4));
  });

  it('defaults unreadCount to 0 while loading', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useNotificationsUnreadCount(), { wrapper: makeWrapper() });

    expect(result.current.unreadCount).toBe(0);
  });

  it('stays idle when spaceId is null', () => {
    mockSpaceId.value = null;

    const { result } = renderHook(() => useNotificationsUnreadCount(), { wrapper: makeWrapper() });

    expect(result.current.unreadCount).toBe(0);
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
