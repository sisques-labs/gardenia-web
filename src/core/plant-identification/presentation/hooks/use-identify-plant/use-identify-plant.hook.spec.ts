import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/plant-identification/application/use-cases/identify-plant/identify-plant.use-case', () => ({
  IdentifyPlantUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/plant-identification/infrastructure/repositories/http/plant-identification-http.repository', () => ({
  plantIdentificationHttpRepository: {},
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: (selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 'space-1' }),
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

import { useIdentifyPlant } from './use-identify-plant.hook';

const mockIdentification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useIdentifyPlant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls IdentifyPlantUseCase.execute(input) on mutate', async () => {
    mockExecute.mockResolvedValue(mockIdentification);
    const file = new File(['x'], 'leaf.png', { type: 'image/png' });
    const input = { photos: [{ file, organ: 'leaf' as const }] };

    const { result } = renderHook(() => useIdentifyPlant(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(input);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith(input));
  });

  it('invalidates the plant-identifications query on success', async () => {
    mockExecute.mockResolvedValue(mockIdentification);
    const file = new File(['x'], 'leaf.png', { type: 'image/png' });

    const { result } = renderHook(() => useIdentifyPlant(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ photos: [{ file, organ: 'leaf' }] });
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plant-identifications', 'space-1'] }),
    );
  });

  it('surfaces errors from the use case', async () => {
    mockExecute.mockRejectedValue(new Error('Provider unavailable'));
    const file = new File(['x'], 'leaf.png', { type: 'image/png' });

    const { result } = renderHook(() => useIdentifyPlant(), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate({ photos: [{ file, organ: 'leaf' }] });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
