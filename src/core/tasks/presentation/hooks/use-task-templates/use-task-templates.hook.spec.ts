import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { TaskBackoffStrategy } from '@/core/tasks/domain/interfaces/task-backoff-strategy.enum';

const { mockExecute, mockPaginated } = vi.hoisted(() => ({
  mockPaginated: {
    items: [
      {
        id: 'tmpl-1',
        name: 'Daily sync',
        defaultPriority: 5,
        defaultRetryCount: 3,
        defaultBackoffStrategy: TaskBackoffStrategy.Exponential,
        defaultTimeoutMs: 30000,
        maxConcurrency: 1,
        defaultIsRecurring: false,
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

vi.mock('@/core/tasks/application/use-cases/list-templates/list-templates.use-case', () => ({
  ListTemplatesUseCase: class {
    execute = mockExecute;
  },
}));

import { useTaskTemplates } from './use-task-templates.hook';

describe('useTaskTemplates', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue(mockPaginated);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns paginated templates', async () => {
    const { result } = renderHook(
      () => useTaskTemplates({ page: 1, pageSize: 10 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPaginated);
    expect(mockExecute).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
  });

  it('passes custom page/pageSize to use case', async () => {
    const { result } = renderHook(
      () => useTaskTemplates({ page: 2, pageSize: 20 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockExecute).toHaveBeenCalledWith({ page: 2, pageSize: 20 });
  });
});
