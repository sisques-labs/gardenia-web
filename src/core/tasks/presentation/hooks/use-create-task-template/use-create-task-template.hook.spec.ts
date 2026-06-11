import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock('@/core/tasks/application/use-cases/create-template/create-template.use-case', () => ({
  CreateTemplateUseCase: class {
    execute = mockExecute;
  },
}));

import { useCreateTaskTemplate } from './use-create-task-template.hook';

describe('useCreateTaskTemplate', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue('tmpl-new');
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('calls CreateTemplateUseCase.execute with input on mutate', async () => {
    const { result } = renderHook(() => useCreateTaskTemplate(), { wrapper });

    const input = {
      name: 'Daily sync',
      defaultRetryCount: 3,
      defaultBackoffStrategy: TaskBackoffStrategy.Exponential,
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith(input);
  });

  it('invalidates [task-templates] query on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateTaskTemplate(), { wrapper });

    result.current.mutate({
      name: 'Test',
      defaultRetryCount: 0,
      defaultBackoffStrategy: TaskBackoffStrategy.Fixed,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task-templates'] });
  });
});
