import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/notifications/application/use-cases/mark-notification-read/mark-notification-read.use-case',
  () => ({
    MarkNotificationReadUseCase: class {
      execute = mockExecute;
    },
  }),
);

vi.mock('@/core/notifications/infrastructure/repositories/graphql/notification.gql.repository', () => ({
  notificationGqlRepository: {},
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useMarkNotificationRead } from './use-mark-notification-read.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useMarkNotificationRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls MarkNotificationReadUseCase.execute(id) on mutate', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('notif-1');
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('notif-1'));
  });

  it('invalidates notifications and unread-count queries on success', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('notif-1');
    });

    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['notifications'] }));
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['notifications-unread-count'] });
  });
});
