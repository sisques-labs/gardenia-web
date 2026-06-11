import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const { mockExecute, mockPaginated } = vi.hoisted(() => ({
  mockPaginated: {
    items: [
      { id: 'r1', taskId: 't1', status: 'completed', output: {}, createdAt: '', updatedAt: '' },
    ],
    total: 1,
    page: 1,
    pageSize: 10,
  },
  mockExecute: vi.fn(),
}));

vi.mock('@/core/tasks/application/use-cases/list-task-runs/list-task-runs.use-case', () => ({
  ListTaskRunsUseCase: class {
    execute = mockExecute;
  },
}));

import { useTaskRuns } from './use-task-runs.hook';

describe('useTaskRuns', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue(mockPaginated);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns paginated task runs when taskId and page/pageSize are provided', async () => {
    const { result } = renderHook(() => useTaskRuns({ taskId: 't1', page: 1, pageSize: 10 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPaginated);
    expect(mockExecute).toHaveBeenCalledWith({ taskId: 't1' });
  });

  it('is disabled when taskId is undefined', () => {
    const { result } = renderHook(() => useTaskRuns({ taskId: undefined, page: 1, pageSize: 10 }), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
