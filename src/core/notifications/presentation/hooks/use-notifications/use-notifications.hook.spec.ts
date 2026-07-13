import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { Notification } from '@/core/notifications/domain/types/notification.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/notifications/application/use-cases/get-notifications/get-notifications.use-case',
  () => ({
    GetNotificationsUseCase: class {
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

import { useNotifications } from './use-notifications.hook';

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'CARE_SCHEDULE_DUE',
    referenceType: 'CARE_SCHEDULE',
    referenceId: 'cs-1',
    payload: { plantName: 'Ficus' },
    status: 'UNREAD',
    readAt: null,
    resolvedAt: null,
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
  },
];

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpaceId.value = 'space-1';
  });

  it('returns notifications on success', async () => {
    mockExecute.mockResolvedValue(mockNotifications);

    const { result } = renderHook(() => useNotifications({ status: 'UNREAD' }), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.notifications).toEqual(mockNotifications));
  });

  it('defaults notifications to an empty array while loading', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useNotifications(), { wrapper: makeWrapper() });

    expect(result.current.notifications).toEqual([]);
  });

  it('stays idle when spaceId is null', () => {
    mockSpaceId.value = null;

    const { result } = renderHook(() => useNotifications(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
