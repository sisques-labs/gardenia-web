import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/plant-photos/application/use-cases/delete-plant-photo/delete-plant-photo.use-case', () => ({
  DeletePlantPhotoUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/plant-photos/infrastructure/repositories/http/plant-photos-http.repository', () => ({
  plantPhotosHttpRepository: {},
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

import { useDeletePlantPhoto } from './use-delete-plant-photo.hook';

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useDeletePlantPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DeletePlantPhotoUseCase.execute(id) on mutate', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePlantPhoto('plant-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('ph1');
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('ph1'));
  });

  it('invalidates plant-photos and plant queries on success', async () => {
    mockExecute.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeletePlantPhoto('plant-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('ph1');
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plant-photos', 'space-1', 'plant-1'] }),
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plant', 'space-1', 'plant-1'] });
  });

  it('surfaces errors from the use case', async () => {
    mockExecute.mockRejectedValue(new Error('Forbidden'));

    const { result } = renderHook(() => useDeletePlantPhoto('plant-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate('ph1');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
