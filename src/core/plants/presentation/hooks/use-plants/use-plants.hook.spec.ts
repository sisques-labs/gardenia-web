import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock('@/core/plants/application/use-cases/get-plants/get-plants.use-case', () => ({
  GetPlantsUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/plants/infrastructure/repositories/plants-http.repository', () => ({
  PlantsHttpRepository: class {},
}));

import { usePlants } from './use-plants.hook';

const mockPlants: Plant[] = [
  { id: 'p1', name: 'Monstera', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
  { id: 'p2', name: 'Pothos', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
];

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('usePlants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns plants data when spaceId is provided', async () => {
    mockExecute.mockResolvedValue(mockPlants);

    const { result } = renderHook(() => usePlants('space-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPlants);
  });

  it('is in loading state initially when spaceId is provided', () => {
    mockExecute.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePlants('space-1'), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('is disabled (not fetching) when spaceId is null', () => {
    const { result } = renderHook(() => usePlants(null), { wrapper: makeWrapper() });

    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('is disabled (not fetching) when spaceId is empty string', () => {
    const { result } = renderHook(() => usePlants(''), { wrapper: makeWrapper() });

    expect(result.current.isFetching).toBe(false);
  });

  it('propagates errors from use case', async () => {
    mockExecute.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePlants('space-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
