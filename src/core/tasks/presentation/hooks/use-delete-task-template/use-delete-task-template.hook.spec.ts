import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const { mockExecute } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
}));

vi.mock('@/core/tasks/application/use-cases/delete-template/delete-template.use-case', () => ({
  DeleteTemplateUseCase: class {
    execute = mockExecute;
  },
}));

import { useDeleteTaskTemplate } from './use-delete-task-template.hook';

describe('useDeleteTaskTemplate', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue(undefined);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['task-templates', 'space-1'], []);
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('calls DeleteTemplateUseCase.execute with templateId on mutate', async () => {
    const { result } = renderHook(() => useDeleteTaskTemplate('space-1'), { wrapper });

    result.current.mutate('tmpl-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith('tmpl-1');
  });

  it('invalidates [task-templates, spaceId] query on success', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteTaskTemplate('space-1'), { wrapper });

    result.current.mutate('tmpl-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['task-templates', 'space-1'] });
  });
});
