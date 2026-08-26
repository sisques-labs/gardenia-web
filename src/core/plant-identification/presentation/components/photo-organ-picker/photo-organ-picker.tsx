'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/select/select';
import type { PlantIdentificationOrgan } from '@/core/plant-identification/domain/interfaces/plant-identification-organ.type';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

export interface PhotoOrganPickerPhoto {
  id: string;
  file: File;
  previewUrl: string;
  organ: PlantIdentificationOrgan;
}

type PhotoOrganPickerDict = Pick<
  AppDict['plantIdentification'],
  | 'addPhoto'
  | 'removePhoto'
  | 'photosHint'
  | 'maxPhotosReached'
  | 'unsupportedFormat'
  | 'organLabel'
  | 'organ'
>;

interface Props {
  photos: PhotoOrganPickerPhoto[];
  onChange: (photos: PhotoOrganPickerPhoto[]) => void;
  dict: PhotoOrganPickerDict;
  maxPhotos?: number;
}

const ORGANS: PlantIdentificationOrgan[] = ['leaf', 'flower', 'fruit', 'bark', 'habit', 'other'];

// Everything PlantNet's identify endpoint accepts — it rejects anything else
// (e.g. webp) with an HTTP 400, so photos are filtered before they ever reach the API.
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png'];

export function PhotoOrganPicker({ photos, onChange, dict, maxPhotos = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasUnsupportedFormat, setHasUnsupportedFormat] = useState(false);
  const atMax = photos.length >= maxPhotos;

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = Math.max(maxPhotos - photos.length, 0);
    const files = Array.from(fileList);
    const supportedFiles = files.filter((file) => ACCEPTED_MIME_TYPES.includes(file.type));
    setHasUnsupportedFormat(supportedFiles.length < files.length);

    const newPhotos: PhotoOrganPickerPhoto[] = supportedFiles.slice(0, remaining).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      organ: 'leaf',
    }));
    if (newPhotos.length > 0) onChange([...photos, ...newPhotos]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removePhoto(id: string) {
    onChange(photos.filter((photo) => photo.id !== id));
  }

  function updateOrgan(id: string, organ: PlantIdentificationOrgan) {
    onChange(photos.map((photo) => (photo.id === id ? { ...photo, organ } : photo)));
  }

  return (
    <div className="flex flex-col gap-3" data-testid="photo-organ-picker">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES.join(',')}
        multiple
        hidden
        data-testid="photo-organ-picker-input"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        data-testid="btn-add-photo"
        disabled={atMax}
        onClick={() => inputRef.current?.click()}
        className="min-h-11 w-full sm:w-auto"
      >
        <ImagePlus className="w-4 h-4" />
        {dict.addPhoto}
      </Button>
      <p className="text-xs text-ink-3">{dict.photosHint}</p>
      {atMax && (
        <p className="text-xs text-ink-3" data-testid="max-photos-reached">
          {dict.maxPhotosReached}
        </p>
      )}
      {hasUnsupportedFormat && (
        <p className="text-xs text-destructive" data-testid="unsupported-format">
          {dict.unsupportedFormat}
        </p>
      )}

      {photos.length > 0 && (
        <ul className="flex flex-col gap-3">
          {photos.map((photo) => (
            <li
              key={photo.id}
              data-testid={`photo-organ-picker-item-${photo.id}`}
              className="flex items-center gap-3 rounded-md border border-rule p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
                <Image src={photo.previewUrl} alt="" fill unoptimized sizes="56px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-xs text-ink-2">{dict.organLabel}</span>
                <Select
                  value={photo.organ}
                  onValueChange={(value) => updateOrgan(photo.id, value as PlantIdentificationOrgan)}
                >
                  <SelectTrigger data-testid={`select-organ-${photo.id}`} className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANS.map((organ) => (
                      <SelectItem key={organ} value={organ}>
                        {dict.organ[organ]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                type="button"
                aria-label={dict.removePhoto}
                data-testid={`btn-remove-photo-${photo.id}`}
                onClick={() => removePhoto(photo.id)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-3 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
