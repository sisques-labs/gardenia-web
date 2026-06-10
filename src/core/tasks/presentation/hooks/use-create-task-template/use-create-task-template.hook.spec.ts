import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const { mockExecute, mockTemplate } = vi.hoisted(() => ({
  mockTemplate: {
    id: 'tmpl-1',
    spaceId: 'space-1',
    name: 'Daily sync',
    defaultPayload: {},
    maxRetries: 3,
    backoffStrategy: 'exponential',
    createdAt: '',
    updatedAt: '',
  },
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
    mockExecute.mockResolvedValue(mockTemplate);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['task-templates', 'space-1'], []);
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('calls CreateTemplateUseCase.execute with input on mutate', async () => {
    const { result } = renderHook(() => useCreateTaskTemplate('space-1'), { wrapper });

    const input = {
      spaceId: 'space-1',
      name: 'Daily sync',
      defaultPayload: {},
      maxRetries: 3,
      backoffStrategy: 'exponential' as const,
    };

    result.current.mutate(input as Parameters<typeof result.current.mutate>[0]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith(input);
  });

  it('invalidates [task-templates, spaceId] query on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateTaskTemplate('space-1'), { wrapper });

    result.current.mutate({
      spaceId: 'space-1',
      name: 'Test',
      defaultPayload: {},
      maxRetries: 0,
      backoffStrategy: 'fixed' as const,
    } as Parameters<typeof result.current.mutate>[0]);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task-templates', 'space-1'] });
  });
});
