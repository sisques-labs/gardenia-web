import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';

const { mockExecute, mockPaginated } = vi.hoisted(() => ({
  mockPaginated: {
    items: [
      {
        id: 't1',
        title: 'Task 1',
        triggerType: 'template',
        status: 'pending',
        payload: {},
        priority: 5,
        isRecurring: false,
        runCount: 0,
        userId: 'u1',
        createdAt: '',
        updatedAt: '',
      },
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

  it('returns paginated tasks when page/pageSize are provided', async () => {
    const { result } = renderHook(() => useTasks({ page: 1, pageSize: 10 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPaginated);
    expect(mockExecute).toHaveBeenCalledWith({ page: 1, pageSize: 10, status: undefined });
  });

  it('passes status filter to use case when provided', async () => {
    const { result } = renderHook(
      () => useTasks({ page: 1, pageSize: 10, status: TaskStatus.Pending }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith({ page: 1, pageSize: 10, status: TaskStatus.Pending });
  });
});
