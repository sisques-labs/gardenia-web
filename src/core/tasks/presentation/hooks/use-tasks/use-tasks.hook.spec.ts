import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const { mockExecute, mockPaginated } = vi.hoisted(() => ({
  mockPaginated: {
    items: [
      { id: 't1', name: 'Task 1', status: 'pending', spaceId: 's1', payload: {}, createdAt: '', updatedAt: '' },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
  },
  mockExecute: vi.fn(),
}));

vi.mock('@/core/tasks/application/use-cases/list-tasks/list-tasks.use-case', () => ({
  ListTasksUseCase: class {
    execute = mockExecute;
  },
}));

import { useTasks } from './use-tasks.hook';

describe('useTasks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue(mockPaginated);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns paginated tasks when spaceId and page/pageSize are provided', async () => {
    const { result } = renderHook(() => useTasks({ spaceId: 's1', page: 1, pageSize: 10 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPaginated);
    expect(mockExecute).toHaveBeenCalledWith({ spaceId: 's1', page: 1, pageSize: 10 });
  });

  it('is disabled when spaceId is null', () => {
    const { result } = renderHook(() => useTasks({ spaceId: null, page: 1, pageSize: 10 }), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
