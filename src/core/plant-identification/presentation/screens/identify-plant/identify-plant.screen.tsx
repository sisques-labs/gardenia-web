'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PhotoOrganPicker, type PhotoOrganPickerPhoto } from '@/core/plant-identification/presentation/components/photo-organ-picker/photo-organ-picker';
import { IdentificationResultPanel } from '@/core/plant-identification/presentation/components/identification-result-panel/identification-result-panel';
import { CreatePlantFromIdentificationModal } from '@/core/plant-identification/presentation/components/create-plant-from-identification-modal/create-plant-from-identification-modal';
import { RecentIdentificationsList } from '@/core/plant-identification/presentation/components/recent-identifications-list/recent-identifications-list';
import { useIdentifyPlant } from '@/core/plant-identification/presentation/hooks/use-identify-plant/use-identify-plant.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { Button } from '@/shared/presentation/components/ui/button/button';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['plantIdentification'];
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

export function IdentifyPlantScreen({ dict, lang, spaceId: spaceIdProp }: Props) {
  const storeSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const spaceId = spaceIdProp ?? storeSpaceId;
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoOrganPickerPhoto[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const identifyMutation = useIdentifyPlant();

  const identification = identifyMutation.data ?? null;
  const error = identifyMutation.isError ? resolveIdentifyErrorType(identifyMutation.error) : null;

  function handleSubmit() {
    identifyMutation.mutate({
      photos: photos.map(({ file, organ }) => ({ file, organ })),
    });
  }

  function handleCreateSuccess(plantId: string) {
    setIsCreateOpen(false);
    router.push(`/${lang}/plants/${plantId}`);
  }

  return (
    <div>
      <ScreenHeader title={dict.title} />

      <div className="flex flex-col gap-8 p-6">
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
          onCreatePlant={() => setIsCreateOpen(true)}
          onRetry={handleSubmit}
        />

        <RecentIdentificationsList spaceId={spaceId} lang={lang} dict={dict.recent} />
      </div>

      {isCreateOpen && identification && identification.status === 'resolved' && (
        <CreatePlantFromIdentificationModal
          identification={identification}
          dict={dict.createModal}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}
