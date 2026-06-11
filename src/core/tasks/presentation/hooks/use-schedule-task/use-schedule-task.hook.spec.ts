import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const { mockExecute } = vi.hoisted(() => ({
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
    mockExecute.mockResolvedValue('task-new-id');
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('calls ScheduleTaskUseCase.execute with input on mutate', async () => {
    const { result } = renderHook(() => useScheduleTask(), { wrapper });

    const input = {
      templateId: 'tmpl-1',
      payload: { cron: '0 8 * * *' },
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith(input);
  });

  it('invalidates [tasks] query on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useScheduleTask(), { wrapper });

    result.current.mutate({ templateId: 'tmpl-1', payload: {} });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['tasks'] });
  });
});
