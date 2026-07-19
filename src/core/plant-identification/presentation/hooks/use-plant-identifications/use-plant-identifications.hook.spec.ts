import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const mockExecute = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/plant-identification/application/use-cases/get-plant-identifications/get-plant-identifications.use-case',
  () => ({
    GetPlantIdentificationsUseCase: class {
      execute = mockExecute;
    },
  }),
);

vi.mock('@/core/plant-identification/infrastructure/repositories/graphql/plant-identification.gql.repository', () => ({
  plantIdentificationGqlRepository: {},
}));

import { usePlantIdentifications } from './use-plant-identifications.hook';

const mockIdentification: PlantIdentification = {
  id: 'ident-1',
  status: 'no_match',
  resolved: null,
  candidates: [],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('usePlantIdentifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns identifications when spaceId is present', async () => {
    mockExecute.mockResolvedValue({ items: [mockIdentification], total: 1 });

    const { result } = renderHook(() => usePlantIdentifications('space-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ items: [mockIdentification], total: 1 });
    expect(mockExecute).toHaveBeenCalledWith('space-1', 1, 5);
  });

  it('is disabled when spaceId is null', () => {
    const { result } = renderHook(() => usePlantIdentifications(null), { wrapper: makeWrapper() });

    expect(result.current.isFetching).toBe(false);
  });

  it('propagates errors from the use case', async () => {
    mockExecute.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => usePlantIdentifications('space-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
