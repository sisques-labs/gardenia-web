import { useState, type RefObject } from 'react';
import { useUploadPlantPhoto } from '@/core/plant-photos/presentation/hooks/use-upload-plant-photo/use-upload-plant-photo.hook';

export function usePlantPhotoUpload(
  plantId: string,
  inputRef?: RefObject<HTMLInputElement | null>,
) {
  const uploadPhoto = useUploadPlantPhoto(plantId);
  const [uploadFailed, setUploadFailed] = useState(false);

  async function uploadFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return;
    setUploadFailed(false);

    const results = await Promise.allSettled(
      Array.from(files).map((file) => uploadPhoto.mutateAsync(file))
    );

    if (results.some((result) => result.status === 'rejected')) {
      setUploadFailed(true);
    }
    if (inputRef?.current) inputRef.current.value = '';
  }

  return { uploadFiles, isUploading: uploadPhoto.isPending, uploadFailed };
}
