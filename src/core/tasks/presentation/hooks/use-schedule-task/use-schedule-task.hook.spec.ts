import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const { mockExecute, mockTask } = vi.hoisted(() => ({
  mockTask: {
    id: 'task-1',
    spaceId: 'space-1',
    templateId: 'tmpl-1',
    name: 'Daily sync',
    status: 'pending',
    payload: { cron: '0 8 * * *' },
    scheduledAt: '2026-06-10T08:00:00Z',
    maxRetries: 3,
    backoffStrategy: 'EXPONENTIAL',
    createdAt: '2026-06-10T00:00:00Z',
    updatedAt: '2026-06-10T00:00:00Z',
  },
  mockExecute: vi.fn(),
}));

vi.mock('@/core/tasks/application/use-cases/schedule-task/schedule-task.use-case', () => ({
  ScheduleTaskUseCase: class {
    execute = mockExecute;
  },
}));

import { useScheduleTask } from './use-schedule-task.hook';

describe('useScheduleTask', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue(mockTask);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['tasks', 'space-1'], []);
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('calls ScheduleTaskUseCase.execute with input on mutate', async () => {
    const { result } = renderHook(() => useScheduleTask('space-1'), { wrapper });

    const input = {
      spaceId: 'space-1',
      templateId: 'tmpl-1',
      name: 'Daily sync',
      scheduledAt: '2026-06-10T08:00:00Z',
      payload: { cron: '0 8 * * *' },
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith(input);
  });

  it('invalidates [tasks, spaceId] query on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useScheduleTask('space-1'), { wrapper });

    result.current.mutate({
      spaceId: 'space-1',
      name: 'Test',
      scheduledAt: '2026-06-10T08:00:00Z',
      payload: {},
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['tasks', 'space-1'] });
  });
});
