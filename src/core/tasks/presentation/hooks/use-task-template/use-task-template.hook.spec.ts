import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const { mockExecute, mockTemplate } = vi.hoisted(() => ({
  mockTemplate: {
    id: 'tmpl-1',
    spaceId: 's1',
    name: 'Daily sync',
    defaultPayload: {},
    maxRetries: 3,
    backoffStrategy: 'exponential',
    createdAt: '',
    updatedAt: '',
  },
  mockExecute: vi.fn(),
}));

vi.mock('@/core/tasks/application/use-cases/get-template/get-template.use-case', () => ({
  GetTemplateUseCase: class {
    execute = mockExecute;
  },
}));

import { useTaskTemplate } from './use-task-template.hook';

describe('useTaskTemplate', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockResolvedValue(mockTemplate);
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('returns template when templateId is provided', async () => {
    const { result } = renderHook(() => useTaskTemplate('tmpl-1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockTemplate);
    expect(mockExecute).toHaveBeenCalledWith('tmpl-1');
  });

  it('is disabled when templateId is null', () => {
    const { result } = renderHook(() => useTaskTemplate(null), { wrapper });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
