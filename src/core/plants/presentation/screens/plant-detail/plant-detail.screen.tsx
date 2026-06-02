'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { PlantSectionPlaceholder } from '@/core/plants/presentation/components/plant-section-placeholder/plant-section-placeholder';
import { usePlant } from '@/core/plants/presentation/hooks/use-plant/use-plant.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shimmer = 'bg-muted rounded animate-pulse';

function DetailSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className={`h-7 w-48 ${shimmer}`} />
        <div className={`h-16 w-16 ml-auto ${shimmer}`} />
      </div>
      {/* Image skeleton */}
      <div className={`h-48 w-full ${shimmer}`} />
      {/* Species skeleton */}
      <div className={`h-5 w-32 ${shimmer}`} />
      {/* Care cards skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-24 w-full ${shimmer}`} />
        ))}
      </div>
    </div>
  );
}

type Props = {
  dict: AppDict['plants'];
  lang: string;
  spaceId: string | null;
  plantId: string;
};

export function PlantDetailScreen({ dict, lang, spaceId: spaceIdProp, plantId }: Props) {
  const router = useRouter();
  const storeSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const spaceId = spaceIdProp ?? storeSpaceId;
  const { data: plant, isLoading, isError } = usePlant(spaceId, plantId);

  useEffect(() => {
    if (isError) {
      router.replace(`/${lang}/plants`);
    }
  }, [isError, lang, router]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || !plant) {
    return null;
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <ScreenHeader
        title={plant.name}
        breadcrumbs={[
          { label: dict.detail.breadcrumbList, href: `/${lang}/plants` },
          { label: plant.name },
        ]}
        actions={
          plant.qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${plant.qr.image}`}
              alt="QR"
              className="h-16 w-16"
            />
          ) : undefined
        }
      />

      {/* Plant image or placeholder */}
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        {plant.imageUrl ? (
          <Image
            src={plant.imageUrl}
            alt={plant.name}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-sm">{dict.detail.noImage}</span>
        )}
      </div>

      {/* Species */}
      <p className="text-sm text-muted-foreground">
        {plant.species?.name ?? dict.detail.noSpecies}
      </p>

      {/* Tab nav */}
      <div className="flex gap-2 border-b">
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary text-primary">
          {dict.detail.tabs.care}
        </button>
        <button className="px-4 py-2 text-sm font-medium text-muted-foreground" disabled>
          {dict.detail.tabs.calendar}
        </button>
        <button className="px-4 py-2 text-sm font-medium text-muted-foreground" disabled>
          {dict.detail.tabs.associations}
        </button>
      </div>

      {/* Care sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PlantSectionPlaceholder
          title={dict.detail.sections.care.title}
          inProgress={dict.detail.sections.care.inProgress}
        />
        <PlantSectionPlaceholder
          title={dict.detail.sections.cycle.title}
          inProgress={dict.detail.sections.cycle.inProgress}
        />
        <PlantSectionPlaceholder
          title={dict.detail.sections.photoHistory.title}
          inProgress={dict.detail.sections.photoHistory.inProgress}
        />
        <PlantSectionPlaceholder
          title={dict.detail.sections.pests.title}
          inProgress={dict.detail.sections.pests.inProgress}
        />
      </div>
    </div>
  );
}
