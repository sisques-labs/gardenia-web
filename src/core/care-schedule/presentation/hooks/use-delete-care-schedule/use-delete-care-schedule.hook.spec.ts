import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/care-schedule/application/use-cases/delete-care-schedule/delete-care-schedule.use-case', () => ({
  DeleteCareScheduleUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository', () => ({
  careScheduleGqlRepository: {},
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useDeleteCareSchedule } from './use-delete-care-schedule.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useDeleteCareSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DeleteCareScheduleUseCase.execute(id) on mutate', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCareSchedule(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('cs-1');
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('cs-1'));
  });

  it('invalidates care-schedules query on success', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteCareSchedule(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('cs-1');
    });

    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['care-schedules'] }));
  });
});
