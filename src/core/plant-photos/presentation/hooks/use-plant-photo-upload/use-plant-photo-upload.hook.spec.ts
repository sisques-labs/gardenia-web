import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const mockMutateAsync = vi.fn();

vi.mock('@/core/plant-photos/presentation/hooks/use-upload-plant-photo/use-upload-plant-photo.hook', () => ({
  useUploadPlantPhoto: vi.fn(() => ({ mutateAsync: mockMutateAsync, isPending: false })),
}));

import { useUploadPlantPhoto } from '@/core/plant-photos/presentation/hooks/use-upload-plant-photo/use-upload-plant-photo.hook';
import { usePlantPhotoUpload } from './use-plant-photo-upload.hook';

describe('usePlantPhotoUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUploadPlantPhoto).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUploadPlantPhoto>);
  });

  it('does nothing when files is null or empty', async () => {
    const { result } = renderHook(() => usePlantPhotoUpload('plant-1'));

    await act(async () => {
      await result.current.uploadFiles(null);
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
    expect(result.current.uploadFailed).toBe(false);
  });

  it('uploads every selected file in parallel', async () => {
    mockMutateAsync.mockResolvedValue(undefined);
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const fileList = { 0: fileA, 1: fileB, length: 2, item: () => null } as unknown as FileList;

    const { result } = renderHook(() => usePlantPhotoUpload('plant-1'));

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    expect(mockMutateAsync).toHaveBeenCalledWith(fileA);
    expect(mockMutateAsync).toHaveBeenCalledWith(fileB);
    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
  });

  it('sets uploadFailed when at least one file fails, without stopping the others', async () => {
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const fileList = { 0: fileA, 1: fileB, length: 2, item: () => null } as unknown as FileList;
    mockMutateAsync.mockImplementation((file: File) =>
      file === fileA ? Promise.reject(new Error('too large')) : Promise.resolve(undefined),
    );

    const { result } = renderHook(() => usePlantPhotoUpload('plant-1'));

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });

    await waitFor(() => expect(result.current.uploadFailed).toBe(true));
    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
  });

  it('resets uploadFailed on a new upload batch', async () => {
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const fileList = { 0: fileA, length: 1, item: () => null } as unknown as FileList;
    mockMutateAsync.mockRejectedValueOnce(new Error('fail')).mockResolvedValue(undefined);

    const { result } = renderHook(() => usePlantPhotoUpload('plant-1'));

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });
    expect(result.current.uploadFailed).toBe(true);

    await act(async () => {
      await result.current.uploadFiles(fileList);
    });
    expect(result.current.uploadFailed).toBe(false);
  });
});
