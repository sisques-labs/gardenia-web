'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PhotoOrganPicker, type PhotoOrganPickerPhoto } from '@/core/plant-identification/presentation/components/photo-organ-picker/photo-organ-picker';
import { IdentificationResultPanel } from '@/core/plant-identification/presentation/components/identification-result-panel/identification-result-panel';
import { CreatePlantFromIdentificationModal } from '@/core/plant-identification/presentation/components/create-plant-from-identification-modal/create-plant-from-identification-modal';
import { RecentIdentificationsList } from '@/core/plant-identification/presentation/components/recent-identifications-list/recent-identifications-list';
import { useIdentifyPlant } from '@/core/plant-identification/presentation/hooks/use-identify-plant/use-identify-plant.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { CreatePlantModal } from '@/core/plants/presentation/components/create-plant-modal/create-plant-modal';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { Button } from '@/shared/presentation/components/ui/button/button';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['plantIdentification'];
  createPlantDict: AppDict['plants']['create'];
  lang: string;
  spaceId: string | null;
};

const MAX_PHOTOS = 5;

function resolveIdentifyErrorType(error: unknown): 'provider' | 'quota' {
  const status =
    (error as { response?: { status?: number } } | undefined)?.response?.status ??
    (error as { status?: number } | undefined)?.status;
  return status === 429 ? 'quota' : 'provider';
}

export function IdentifyPlantScreen({ dict, createPlantDict, lang, spaceId: spaceIdProp }: Props) {
  const storeSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const spaceId = spaceIdProp ?? storeSpaceId;
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoOrganPickerPhoto[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState<'identification' | 'manual' | null>(null);
  const [manualSeedName, setManualSeedName] = useState<string | undefined>(undefined);
  const [seededIdentificationId, setSeededIdentificationId] = useState<string | undefined>(undefined);
  const identifyMutation = useIdentifyPlant();

  const identification = identifyMutation.data ?? null;
  const error = identifyMutation.isError ? resolveIdentifyErrorType(identifyMutation.error) : null;

  const resolvedIndex =
    identification?.status === 'resolved' && identification.resolved
      ? identification.candidates.findIndex((candidate) => candidate.scientificName === identification.resolved?.scientificName)
      : -1;

  // Pre-select the server's own pick whenever a new identification result
  // arrives — adjusted during render (React's recommended pattern for
  // deriving state from a changed value) rather than in an effect, which
  // would cause an extra render pass.
  if (identification?.id !== seededIdentificationId) {
    setSeededIdentificationId(identification?.id);
    setSelectedIndex(resolvedIndex >= 0 ? resolvedIndex : null);
  }

  function handleSubmit() {
    identifyMutation.mutate({
      photos: photos.map(({ file, organ }) => ({ file, organ })),
    });
  }

  function handleConfirm() {
    if (!identification || selectedIndex === null) return;
    if (selectedIndex === resolvedIndex) {
      setOpenModal('identification');
    } else {
      setManualSeedName(identification.candidates[selectedIndex]?.scientificName);
      setOpenModal('manual');
    }
  }

  function handleNoneMatch() {
    setManualSeedName(undefined);
    setOpenModal('manual');
  }

  function handleCreateFromIdentificationSuccess(plantId: string) {
    setOpenModal(null);
    router.push(`/${lang}/plants/${plantId}`);
  }

  return (
    <div>
      <ScreenHeader title={dict.title} />

      <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-4">
          <PhotoOrganPicker photos={photos} onChange={setPhotos} dict={dict} maxPhotos={MAX_PHOTOS} />
          <Button
            type="button"
            data-testid="btn-submit-identify"
            disabled={photos.length === 0 || identifyMutation.isPending}
            onClick={handleSubmit}
          >
            {identifyMutation.isPending ? dict.submitting : dict.submit}
          </Button>
        </div>

        <IdentificationResultPanel
          identification={identification}
          error={error}
          dict={dict}
          selectedIndex={selectedIndex}
          onSelectCandidate={setSelectedIndex}
          onConfirm={handleConfirm}
          onNoneMatch={handleNoneMatch}
          onRetry={handleSubmit}
        />
      </div>

      <div className="px-6 pb-6">
        <RecentIdentificationsList spaceId={spaceId} lang={lang} dict={dict.recent} />
      </div>

      {openModal === 'identification' && identification && (
        <CreatePlantFromIdentificationModal
          identification={identification}
          dict={dict.createModal}
          onClose={() => setOpenModal(null)}
          onSuccess={handleCreateFromIdentificationSuccess}
        />
      )}

      {openModal === 'manual' && (
        <CreatePlantModal
          spaceId={spaceId}
          dict={createPlantDict}
          onClose={() => setOpenModal(null)}
          initialImageUrl={identification?.photos[0]?.url}
          initialSpeciesName={manualSeedName}
        />
      )}
    </div>
  );
}
