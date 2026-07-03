import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/planting-spots/application/use-cases/mark-planting-spot-fallow/mark-planting-spot-fallow.use-case', () => ({
  MarkPlantingSpotFallowUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/planting-spots/infrastructure/repositories/graphql/planting-spots.gql.repository', () => ({
  PlantingSpotsGqlRepository: class {},
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useMarkPlantingSpotFallow } from './use-mark-planting-spot-fallow.hook';

const mockCreatedEntity = { id: 'spot-1' };

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useMarkPlantingSpotFallow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls MarkPlantingSpotFallowUseCase.execute(id) on mutate', async () => {
    mockExecute.mockResolvedValue(mockCreatedEntity);

    const { result } = renderHook(() => useMarkPlantingSpotFallow(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('spot-1');
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('spot-1'));
  });

  it('invalidates list and detail queries on success', async () => {
    mockExecute.mockResolvedValue(mockCreatedEntity);

    const { result } = renderHook(() => useMarkPlantingSpotFallow(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('spot-1');
    });

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spots'] });
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['planting-spot', 'spot-1'] });
    });
  });
});
