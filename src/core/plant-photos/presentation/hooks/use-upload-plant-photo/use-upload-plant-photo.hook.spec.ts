import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { PlantPhoto } from '@/core/plant-photos/domain/interfaces/plant-photo.interface';

const mockExecute = vi.hoisted(() => vi.fn());
const mockInvalidateQueries = vi.hoisted(() => vi.fn());

vi.mock('@/core/plant-photos/application/use-cases/upload-plant-photo/upload-plant-photo.use-case', () => ({
  UploadPlantPhotoUseCase: class {
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

import { useUploadPlantPhoto } from './use-upload-plant-photo.hook';

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
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe('useUploadPlantPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls UploadPlantPhotoUseCase.execute(plantId, file) on mutate', async () => {
    mockExecute.mockResolvedValue(mockPhoto);
    const file = new File(['x'], 'rose.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadPlantPhoto('plant-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(file);
    });

    await waitFor(() => expect(mockExecute).toHaveBeenCalledWith('plant-1', file));
  });

  it('invalidates plant-photos and plant queries on success', async () => {
    mockExecute.mockResolvedValue(mockPhoto);
    const file = new File(['x'], 'rose.png', { type: 'image/png' });

    const { result } = renderHook(() => useUploadPlantPhoto('plant-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(file);
    });

    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plant-photos', 'space-1', 'plant-1'] }),
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['plant', 'space-1', 'plant-1'] });
  });

  it('surfaces errors from the use case', async () => {
    mockExecute.mockRejectedValue(new Error('Unsupported file type'));
    const file = new File(['x'], 'notes.txt', { type: 'text/plain' });

    const { result } = renderHook(() => useUploadPlantPhoto('plant-1'), { wrapper: makeWrapper() });

    await act(async () => {
      result.current.mutate(file);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
