import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { LastCareByType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/care-log/application/use-cases/get-plant-care-logs/get-plant-care-logs.use-case',
  () => ({
    GetPlantCareLogsUseCase: class {
      execute = mockExecute;
    },
  }),
);

vi.mock('@/core/care-log/infrastructure/repositories/graphql/care-log.gql.repository', () => ({
  careLogGqlRepository: {},
}));

const mockSpaceId = vi.hoisted(() => ({ value: 'space-1' as string | null }));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: (selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: mockSpaceId.value }),
}));

import { usePlantCareLogs } from './use-plant-care-logs.hook';

const mockLastCare: LastCareByType = {
  [CareLogActivityType.WATERING]: {
    id: 'entry-1',
    plantId: 'plant-1',
    userId: 'user-1',
    spaceId: 'space-1',
    activityType: CareLogActivityType.WATERING,
    performedAt: '2024-01-10T10:00:00.000Z',
    notes: null,
    quantity: null,
    unit: null,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  },
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('usePlantCareLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSpaceId.value = 'space-1';
  });

  it('retorna LastCareByType en éxito', async () => {
    mockExecute.mockResolvedValue(mockLastCare);

    const { result } = renderHook(() => usePlantCareLogs('plant-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockLastCare);
  });

  it('permanece idle cuando spaceId es null', () => {
    mockSpaceId.value = null;

    const { result } = renderHook(() => usePlantCareLogs('plant-1'), { wrapper: makeWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('permanece idle cuando plantId está vacío', () => {
    const { result } = renderHook(() => usePlantCareLogs(''), { wrapper: makeWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
  });
});
