import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { TaskStatus } from '@/core/tasks/domain/interfaces/task-status.enum';

const { mockExecute, mockTask } = vi.hoisted(() => ({
  mockTask: {
    id: 'task-1',
    spaceId: 'space-1',
    templateId: 'tmpl-1',
    name: 'Daily sync',
    status: 'cancelled',
    payload: {},
    scheduledAt: '2026-06-10T08:00:00Z',
    maxRetries: 3,
    backoffStrategy: 'EXPONENTIAL',
    createdAt: '2026-06-10T00:00:00Z',
    updatedAt: '2026-06-10T00:00:00Z',
  },
  mockExecute: vi.fn(),
}));

vi.mock('@/core/tasks/application/use-cases/cancel-task/cancel-task.use-case', () => ({
  CancelTaskUseCase: class {
    execute = mockExecute;
  },
}));

import { useCancelTask } from './use-cancel-task.hook';

describe('useCancelTask', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue(mockTask);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['tasks', 'space-1'], []);
    queryClient.setQueryData(['task', 'task-1'], mockTask);
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('calls CancelTaskUseCase.execute with taskId on mutate', async () => {
    const { result } = renderHook(() => useCancelTask('space-1'), { wrapper });

    result.current.mutate('task-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith('task-1');
  });

  it('invalidates [tasks, spaceId] and [task, taskId] queries on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCancelTask('space-1'), { wrapper });

    result.current.mutate('task-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['tasks', 'space-1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task', 'task-1'] });
  });
});
