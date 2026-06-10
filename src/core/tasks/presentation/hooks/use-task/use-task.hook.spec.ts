import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const { mockExecute, mockTask } = vi.hoisted(() => ({
  mockTask: {
    id: 't1',
    name: 'Task 1',
    status: 'pending',
    spaceId: 's1',
    payload: {},
    createdAt: '',
    updatedAt: '',
  },
  mockExecute: vi.fn(),
}));

vi.mock('@/core/tasks/application/use-cases/get-task/get-task.use-case', () => ({
  GetTaskUseCase: class {
    execute = mockExecute;
  },
}));

import { useTask } from './use-task.hook';

describe('useTask', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue(mockTask);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns the task when id is provided', async () => {
    const { result } = renderHook(() => useTask('t1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockTask);
    expect(mockExecute).toHaveBeenCalledWith('t1');
  });

  it('is disabled when id is undefined', () => {
    const { result } = renderHook(() => useTask(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
