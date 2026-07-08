'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useDeletePlantPhoto } from '@/core/plant-photos/presentation/hooks/use-delete-plant-photo/use-delete-plant-photo.hook';
import { usePlantPhotos } from '@/core/plant-photos/presentation/hooks/use-plant-photos/use-plant-photos.hook';
import { useUploadPlantPhoto } from '@/core/plant-photos/presentation/hooks/use-upload-plant-photo/use-upload-plant-photo.hook';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  plantId: string;
  dict: AppDict['plantPhotos'];
};

export function PlantPhotoGallery({ plantId, dict }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { data: photos = [] } = usePlantPhotos(plantId);
  const uploadPhoto = useUploadPlantPhoto(plantId);
  const deletePhoto = useDeletePlantPhoto(plantId);
  const [uploadFailed, setUploadFailed] = useState(false);

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadFailed(false);

    for (const file of Array.from(files)) {
      try {
        await uploadPhoto.mutateAsync(file);
      } catch {
        setUploadFailed(true);
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        data-testid="plant-photo-input"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <Button
        variant="outline"
        size="sm"
        loading={uploadPhoto.isPending}
        data-testid="btn-add-photo"
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="w-4 h-4" />
        {uploadPhoto.isPending ? dict.uploading : dict.addPhoto}
      </Button>

      {uploadFailed && <Alert variant="error" message={dict.uploadError} />}
      {deletePhoto.isError && <Alert variant="error" message={dict.deleteError} />}

      {photos.length > 0 && (
        <div data-testid="plant-photo-gallery" className="flex gap-2 overflow-x-auto">
          {photos.map((photo) => (
            <div
              key={photo.id}
              data-testid={`plant-photo-${photo.id}`}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-[var(--rule)]"
            >
              <Image src={photo.url} alt="" fill className="object-cover" sizes="80px" />
              {currentUser?.userId === photo.userId && (
                <button
                  type="button"
                  aria-label={dict.deletePhoto}
                  data-testid={`btn-delete-photo-${photo.id}`}
                  onClick={() => deletePhoto.mutate(photo.id)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
