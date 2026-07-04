import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { WaterPlantResult } from '@/core/care-schedule/domain/types/care-schedule.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/care-schedule/application/use-cases/water-plant/water-plant.use-case', () => ({
  WaterPlantUseCase: class {
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

import { useWaterPlant } from './use-water-plant.hook';

const mockWaterPlantResult: WaterPlantResult = {
  plantId: 'plant-1',
  mode: 'SCHEDULE_COMPLETED',
  careScheduleId: 'cs-1',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useWaterPlant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls WaterPlantUseCase.execute(plantId, performedAt) on mutate', async () => {
    mockExecute.mockResolvedValue(mockWaterPlantResult);

    const { result } = renderHook(() => useWaterPlant(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ plantId: 'plant-1', performedAt: '2026-07-05' });
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('plant-1', '2026-07-05'));
  });

  it('invalidates care-schedules and care-log queries on success', async () => {
    mockExecute.mockResolvedValue(mockWaterPlantResult);

    const { result } = renderHook(() => useWaterPlant(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ plantId: 'plant-1' });
    });

    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['care-schedules'] }));
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['care-log'] });
  });
});
