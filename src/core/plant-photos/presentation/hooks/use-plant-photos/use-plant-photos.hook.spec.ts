import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { PlantPhoto } from '@/core/plant-photos/domain/interfaces/plant-photo.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockCurrentSpaceId = vi.hoisted(() => ({ value: 'space-1' as string | null }));

vi.mock('@/core/plant-photos/application/use-cases/get-plant-photos/get-plant-photos.use-case', () => ({
  GetPlantPhotosUseCase: class {
    execute = mockExecute;
  },
}));

vi.mock('@/core/plant-photos/infrastructure/repositories/http/plant-photos-http.repository', () => ({
  plantPhotosHttpRepository: {},
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: (selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: mockCurrentSpaceId.value }),
}));

import { usePlantPhotos } from './use-plant-photos.hook';

const mockPhoto: PlantPhoto = {
  id: 'ph1',
  plantId: 'plant-1',
  fileId: 'file-1',
  url: '/api/files/file-1/content',
  userId: 'u1',
  spaceId: 'space-1',
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

describe('usePlantPhotos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentSpaceId.value = 'space-1';
  });

  it('returns photos when spaceId and plantId are present', async () => {
    mockExecute.mockResolvedValue([mockPhoto]);

    const { result } = renderHook(() => usePlantPhotos('plant-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockPhoto]);
  });

  it('is disabled when spaceId is null', () => {
    mockCurrentSpaceId.value = null;

    const { result } = renderHook(() => usePlantPhotos('plant-1'), { wrapper: makeWrapper() });

    expect(result.current.isFetching).toBe(false);
  });

  it('is disabled when plantId is empty', () => {
    const { result } = renderHook(() => usePlantPhotos(''), { wrapper: makeWrapper() });

    expect(result.current.isFetching).toBe(false);
  });

  it('propagates errors from the use case', async () => {
    mockExecute.mockRejectedValue(new Error('List failed'));

    const { result } = renderHook(() => usePlantPhotos('plant-1'), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
