import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/care-schedule/application/use-cases/get-care-schedules/get-care-schedules.use-case',
  () => ({
    GetCareSchedulesUseCase: class {
      execute = mockExecute;
    },
  }),
);

vi.mock('@/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository', () => ({
  careScheduleGqlRepository: {},
}));

const mockSpaceId = vi.hoisted(() => ({ value: 'space-1' as string | null }));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: (selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: mockSpaceId.value }),
}));

import { useCareSchedules } from './use-care-schedules.hook';

const mockCareSchedules: CareSchedule[] = [
  {
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
  },
];

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useCareSchedules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpaceId.value = 'space-1';
  });

  it('returns care schedules on success', async () => {
    mockExecute.mockResolvedValue(mockCareSchedules);

    const { result } = renderHook(() => useCareSchedules({ plantId: 'plant-1' }), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.careSchedules).toEqual(mockCareSchedules));
  });

  it('defaults careSchedules to an empty array while loading', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCareSchedules(), { wrapper: makeWrapper() });

    expect(result.current.careSchedules).toEqual([]);
  });

  it('stays idle when spaceId is null', () => {
    mockSpaceId.value = null;

    const { result } = renderHook(() => useCareSchedules(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
