import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { UpdateHarvestInput } from '@/core/harvests/application/interfaces/update-harvest-input.interface';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/harvests/application/use-cases/update-harvest/update-harvest.use-case', () => ({
  UpdateHarvestUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/harvests/infrastructure/repositories/graphql/harvests.gql.repository', () => ({
  HarvestsGqlRepository: class {},
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useUpdateHarvest } from './use-update-harvest.hook';

const mockHarvest: Harvest = {
  id: 'h1',
  cropType: 'Tomato',
  quantity: 3,
  unit: 'KG',
  harvestedAt: '2026-06-01',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2026-06-01',
  updatedAt: '2026-06-02',
};

const input: UpdateHarvestInput = { id: 'h1', quantity: 3 };

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useUpdateHarvest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls UpdateHarvestUseCase.execute(input) on mutate', async () => {
    mockExecute.mockResolvedValue(mockHarvest);

    const { result } = renderHook(() => useUpdateHarvest(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith(input));
  });

  it('invalidates harvests query on success', async () => {
    mockExecute.mockResolvedValue(mockHarvest);

    const { result } = renderHook(() => useUpdateHarvest(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['harvests'] })
    );
  });
});
