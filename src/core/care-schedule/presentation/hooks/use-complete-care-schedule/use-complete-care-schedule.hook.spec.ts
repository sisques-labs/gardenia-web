import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/care-schedule/application/use-cases/complete-care-schedule/complete-care-schedule.use-case', () => ({
  CompleteCareScheduleUseCase: class {
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

import { useCompleteCareSchedule } from './use-complete-care-schedule.hook';

const mockCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'WATERING',
  intervalDays: 3,
  quantity: null,
  unit: null,
  notes: null,
  nextDueAt: '2026-07-08',
  lastCompletedAt: '2026-07-05',
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-05',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useCompleteCareSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls CompleteCareScheduleUseCase.execute(id, completedAt) on mutate', async () => {
    mockExecute.mockResolvedValue(mockCareSchedule);

    const { result } = renderHook(() => useCompleteCareSchedule(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'cs-1', completedAt: '2026-07-05' });
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('cs-1', '2026-07-05'));
  });

  it('invalidates care-schedules query on success', async () => {
    mockExecute.mockResolvedValue(mockCareSchedule);

    const { result } = renderHook(() => useCompleteCareSchedule(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ id: 'cs-1' });
    });

    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['care-schedules'] }));
  });
});
