import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/notifications/application/use-cases/mark-all-notifications-read/mark-all-notifications-read.use-case',
  () => ({
    MarkAllNotificationsReadUseCase: class {
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

import { useMarkAllNotificationsRead } from './use-mark-all-notifications-read.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useMarkAllNotificationsRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls MarkAllNotificationsReadUseCase.execute() on mutate', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkAllNotificationsRead(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalled());
  });

  it('invalidates notifications and unread-count queries on success', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useMarkAllNotificationsRead(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['notifications'] }));
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['notifications-unread-count'] });
  });
});
