import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/plants/application/use-cases/get-plant/get-plant.use-case', () => ({
  GetPlantUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/plants/infrastructure/repositories/graphql/plants.gql.repository', () => ({
  PlantsGqlRepository: class {},
}));

import { usePlant } from './use-plant.hook';

const mockPlant: Plant = {
  id: 'p1',
  name: 'Monstera',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '',
  updatedAt: '',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('usePlant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns plant data when spaceId and id are provided', async () => {
    mockExecute.mockResolvedValue(mockPlant);

    const { result } = renderHook(() => usePlant('space-1', 'p1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPlant);
  });

  it('is in loading state initially when spaceId and id are provided', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePlant('space-1', 'p1'), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('is disabled when spaceId is null', () => {
    const { result } = renderHook(() => usePlant(null, 'p1'), { wrapper: makeWrapper() });

    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('is disabled when id is empty string', () => {
    const { result } = renderHook(() => usePlant('space-1', ''), { wrapper: makeWrapper() });

    expect(result.current.isFetching).toBe(false);
  });

  it('propagates errors from use case', async () => {
    mockExecute.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => usePlant('space-1', 'p1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
