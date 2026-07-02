import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { CreateCareScheduleInput } from '@/core/care-schedule/application/interfaces/create-care-schedule-input.interface';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/care-schedule/application/use-cases/create-care-schedule/create-care-schedule.use-case', () => ({
  CreateCareScheduleUseCase: class {
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

import { useCreateCareSchedule } from './use-create-care-schedule.hook';

const mockCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'WATERING',
  intervalDays: 3,
  quantity: null,
  unit: null,
  notes: null,
  nextDueAt: '2026-07-05',
  lastCompletedAt: null,
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-01',
};

const input: CreateCareScheduleInput = { plantId: 'plant-1', activityType: 'WATERING', intervalDays: 3 };

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useCreateCareSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls CreateCareScheduleUseCase.execute(input) on mutate', async () => {
    mockExecute.mockResolvedValue(mockCareSchedule);

    const { result } = renderHook(() => useCreateCareSchedule(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith(input));
  });

  it('invalidates care-schedules query on success', async () => {
    mockExecute.mockResolvedValue(mockCareSchedule);

    const { result } = renderHook(() => useCreateCareSchedule(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['care-schedules'] }));
  });
});
