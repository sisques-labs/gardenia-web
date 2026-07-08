import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUploadMutateAsync = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock('@/core/plant-photos/presentation/hooks/use-plant-photos/use-plant-photos.hook', () => ({
  usePlantPhotos: vi.fn(),
}));

vi.mock('@/core/plant-photos/presentation/hooks/use-upload-plant-photo/use-upload-plant-photo.hook', () => ({
  useUploadPlantPhoto: vi.fn(() => ({ mutateAsync: mockUploadMutateAsync, isPending: false })),
}));

vi.mock('@/core/plant-photos/presentation/hooks/use-delete-plant-photo/use-delete-plant-photo.hook', () => ({
  useDeletePlantPhoto: vi.fn(() => ({ mutate: mockDeleteMutate, isError: false })),
}));

vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: vi.fn((selector: (s: { currentUser: { userId: string } | null }) => unknown) =>
    selector({ currentUser: { userId: 'u1' } }),
  ),
}));

import { usePlantPhotos } from '@/core/plant-photos/presentation/hooks/use-plant-photos/use-plant-photos.hook';
import { useUploadPlantPhoto } from '@/core/plant-photos/presentation/hooks/use-upload-plant-photo/use-upload-plant-photo.hook';
import { useDeletePlantPhoto } from '@/core/plant-photos/presentation/hooks/use-delete-plant-photo/use-delete-plant-photo.hook';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { PlantPhotoGallery } from './plant-photo-gallery';

const dict = {
  addPhoto: 'Add photo',
  uploading: 'Uploading...',
  uploadError: 'Could not upload the photo. Try again.',
  deletePhoto: 'Delete photo',
  deleteError: 'Could not delete the photo. Try again.',
};

const photoA = {
  id: 'ph-a',
  plantId: 'plant-1',
  fileId: 'file-a',
  url: '/api/files/file-a/content',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '',
  updatedAt: '',
};

const photoB = { ...photoA, id: 'ph-b', fileId: 'file-b', url: '/api/files/file-b/content', userId: 'u2' };

describe('PlantPhotoGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePlantPhotos).mockReturnValue({ data: [] } as unknown as ReturnType<typeof usePlantPhotos>);
    vi.mocked(useUploadPlantPhoto).mockReturnValue({
      mutateAsync: mockUploadMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useUploadPlantPhoto>);
    vi.mocked(useDeletePlantPhoto).mockReturnValue({
      mutate: mockDeleteMutate,
      isError: false,
    } as unknown as ReturnType<typeof useDeletePlantPhoto>);
  });

  it('renders the add-photo button', () => {
    render(<PlantPhotoGallery plantId="plant-1" dict={dict} />);

    expect(screen.getByTestId('btn-add-photo')).toBeInTheDocument();
  });

  it('renders thumbnails for each photo', () => {
    vi.mocked(usePlantPhotos).mockReturnValue({
      data: [photoA, photoB],
    } as unknown as ReturnType<typeof usePlantPhotos>);

    render(<PlantPhotoGallery plantId="plant-1" dict={dict} />);

    expect(screen.getByTestId('plant-photo-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('plant-photo-ph-a')).toBeInTheDocument();
    expect(screen.getByTestId('plant-photo-ph-b')).toBeInTheDocument();
  });

  it('does not render the gallery strip when there are no photos', () => {
    render(<PlantPhotoGallery plantId="plant-1" dict={dict} />);

    expect(screen.queryByTestId('plant-photo-gallery')).not.toBeInTheDocument();
  });

  it('uploads each selected file via useUploadPlantPhoto', async () => {
    mockUploadMutateAsync.mockResolvedValue(photoA);
    const user = userEvent.setup();
    render(<PlantPhotoGallery plantId="plant-1" dict={dict} />);

    const file = new File(['x'], 'rose.png', { type: 'image/png' });
    const input = screen.getByTestId('plant-photo-input') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => expect(mockUploadMutateAsync).toHaveBeenCalledWith(file));
  });

  it('shows an upload error alert when a file fails to upload (e.g. server-side rejection)', async () => {
    mockUploadMutateAsync.mockRejectedValue(new Error('File too large'));
    const user = userEvent.setup();
    render(<PlantPhotoGallery plantId="plant-1" dict={dict} />);

    // Client-side accept="image/*" only filters obviously wrong types; a
    // same-typed file can still be rejected server-side (size, corrupt data...).
    const file = new File(['x'], 'huge.png', { type: 'image/png' });
    const input = screen.getByTestId('plant-photo-input') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => expect(screen.getByText(dict.uploadError)).toBeInTheDocument());
  });

  it('shows a delete button only for the uploader own photos', () => {
    vi.mocked(usePlantPhotos).mockReturnValue({
      data: [photoA, photoB],
    } as unknown as ReturnType<typeof usePlantPhotos>);

    render(<PlantPhotoGallery plantId="plant-1" dict={dict} />);

    expect(screen.getByTestId('btn-delete-photo-ph-a')).toBeInTheDocument();
    expect(screen.queryByTestId('btn-delete-photo-ph-b')).not.toBeInTheDocument();
  });

  it('calls useDeletePlantPhoto().mutate when the delete button is clicked', async () => {
    vi.mocked(usePlantPhotos).mockReturnValue({
      data: [photoA],
    } as unknown as ReturnType<typeof usePlantPhotos>);
    const user = userEvent.setup();

    render(<PlantPhotoGallery plantId="plant-1" dict={dict} />);
    await user.click(screen.getByTestId('btn-delete-photo-ph-a'));

    expect(mockDeleteMutate).toHaveBeenCalledWith('ph-a');
  });

  it('renders a delete error alert when deletion fails', () => {
    vi.mocked(useDeletePlantPhoto).mockReturnValue({
      mutate: mockDeleteMutate,
      isError: true,
    } as unknown as ReturnType<typeof useDeletePlantPhoto>);

    render(<PlantPhotoGallery plantId="plant-1" dict={dict} />);

    expect(screen.getByText(dict.deleteError)).toBeInTheDocument();
  });

  it('does not render any delete button when the user is not authenticated', () => {
    vi.mocked(useAuthStore).mockImplementation(((selector: (s: { currentUser: null }) => unknown) =>
      selector({ currentUser: null })) as typeof useAuthStore);
    vi.mocked(usePlantPhotos).mockReturnValue({
      data: [photoA],
    } as unknown as ReturnType<typeof usePlantPhotos>);

    render(<PlantPhotoGallery plantId="plant-1" dict={dict} />);

    expect(screen.queryByTestId('btn-delete-photo-ph-a')).not.toBeInTheDocument();
  });
});
