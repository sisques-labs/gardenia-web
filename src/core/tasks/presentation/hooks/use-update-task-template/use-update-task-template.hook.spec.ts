import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const { mockExecute, mockTemplate } = vi.hoisted(() => ({
  mockTemplate: {
    id: 'tmpl-1',
    spaceId: 'space-1',
    name: 'Updated sync',
    defaultPayload: {},
    maxRetries: 3,
    backoffStrategy: 'exponential',
    createdAt: '',
    updatedAt: '',
  },
  mockExecute: vi.fn(),
}));

vi.mock('@/core/tasks/application/use-cases/update-template/update-template.use-case', () => ({
  UpdateTemplateUseCase: class {
    execute = mockExecute;
  },
}));

import { useUpdateTaskTemplate } from './use-update-task-template.hook';

describe('useUpdateTaskTemplate', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue(mockTemplate);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['task-templates', 'space-1'], []);
    queryClient.setQueryData(['task-template', 'tmpl-1'], {});
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('calls UpdateTemplateUseCase.execute with input on mutate', async () => {
    const { result } = renderHook(() => useUpdateTaskTemplate('space-1'), { wrapper });

    const input = { id: 'tmpl-1', name: 'Updated sync' };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith(input);
  });

  it('invalidates [task-templates, spaceId] and [task-template, id] on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useUpdateTaskTemplate('space-1'), { wrapper });

    result.current.mutate({ id: 'tmpl-1', name: 'Updated' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task-templates', 'space-1'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task-template', 'tmpl-1'] });
  });
});
