'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useDeletePlantPhoto } from '@/core/plant-photos/presentation/hooks/use-delete-plant-photo/use-delete-plant-photo.hook';
import { usePlantPhotoUpload } from '@/core/plant-photos/presentation/hooks/use-plant-photo-upload/use-plant-photo-upload.hook';
import { usePlantPhotos } from '@/core/plant-photos/presentation/hooks/use-plant-photos/use-plant-photos.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Lightbox } from '@/shared/presentation/components/ui/lightbox/lightbox';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { formatShortDate } from '@/shared/presentation/utils/format-short-date.util';
import { getAuthenticatedImageUrl } from '@/shared/presentation/utils/get-authenticated-image-url.util';

type Props = {
  plantId: string;
  lang: string;
  dict: AppDict['plantPhotos'];
};

export function PlantPhotoGallery({ plantId, lang, dict }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const currentUser = useAuthStore((s) => s.currentUser);
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const { data: photos = [] } = usePlantPhotos(plantId);
  const { uploadFiles, isUploading, uploadFailed } = usePlantPhotoUpload(plantId, inputRef);
  const deletePhoto = useDeletePlantPhoto(plantId);

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        data-testid="plant-photo-input"
        onChange={(e) => uploadFiles(e.target.files)}
      />
      <Button
        variant="outline"
        size="sm"
        loading={isUploading}
        data-testid="btn-add-photo"
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="w-4 h-4" />
        {isUploading ? dict.uploading : dict.addPhoto}
      </Button>

      {uploadFailed && <Alert variant="error" message={dict.uploadError} />}
      {deletePhoto.isError && <Alert variant="error" message={dict.deleteError} />}

      {photos.length > 0 && (
        <div data-testid="plant-photo-gallery" className="flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              data-testid={`plant-photo-${photo.id}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelectedIndex(index);
              }}
              className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-1 ring-rule"
            >
              <Image
                src={
                  getAuthenticatedImageUrl(photo.url, accessToken, currentSpaceId) ??
                  photo.url
                }
                alt=""
                fill
                className="object-cover"
                sizes="80px"
                unoptimized
              />
              {currentUser?.userId === photo.userId && (
                <button
                  type="button"
                  aria-label={dict.deletePhoto}
                  data-testid={`btn-delete-photo-${photo.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhoto.mutate(photo.id);
                  }}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Lightbox
        photos={photos.map((photo) => ({
          src: getAuthenticatedImageUrl(photo.url, accessToken, currentSpaceId) ?? photo.url,
          alt: '',
          caption: `${dict.uploadedOn} ${formatShortDate(photo.createdAt, lang)}`,
        }))}
        initialIndex={selectedIndex ?? 0}
        open={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
      />
    </div>
  );
}
