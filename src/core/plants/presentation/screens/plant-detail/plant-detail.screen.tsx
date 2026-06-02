'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Droplets, Camera, StickyNote } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { PlantSectionPlaceholder } from '@/core/plants/presentation/components/plant-section-placeholder/plant-section-placeholder';
import { usePlant } from '@/core/plants/presentation/hooks/use-plant/use-plant.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shimmer = 'bg-muted rounded animate-pulse';

function DetailSkeleton() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className={`h-7 w-48 ${shimmer}`} />
      </div>
      <div className={`h-48 w-full ${shimmer}`} />
      <div className={`h-5 w-32 ${shimmer}`} />
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

  if (isLoading) return <DetailSkeleton />;
  if (isError || !plant) return null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <ScreenHeader
        title={plant.name}
        breadcrumbs={[
          { label: dict.detail.breadcrumbList, href: `/${lang}/plants` },
          { label: plant.name },
        ]}
      />

      <div className="p-6 flex flex-col gap-6">
        {/* Species */}
        <p className="text-sm text-muted-foreground italic">
          {plant.species?.name ?? dict.detail.noSpecies}
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled>
            <Droplets className="w-4 h-4 mr-1.5" />
            {dict.detail.actions.markWatered}
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Camera className="w-4 h-4 mr-1.5" />
            {dict.detail.actions.addPhoto}
          </Button>
          <Button variant="outline" size="sm" disabled>
            <StickyNote className="w-4 h-4 mr-1.5" />
            {dict.detail.actions.newNote}
          </Button>
        </div>

        {/* Plant image */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
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

        {/* QR section */}
        {plant.qr && (
          <div className="flex items-center gap-4 rounded-lg border p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${plant.qr.image}`}
              alt="QR"
              className="h-16 w-16 shrink-0"
            />
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm font-medium">{dict.detail.qr.label}</p>
              <p className="text-xs text-muted-foreground">{dict.detail.qr.hint}</p>
              <button disabled className="text-xs text-[var(--forest)] opacity-40 cursor-not-allowed text-left w-fit">
                {dict.detail.qr.download} →
              </button>
            </div>
          </div>
        )}

        {/* Tab nav */}
        <div className="flex gap-0 border-b">
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
          <PlantSectionPlaceholder title={dict.detail.sections.care.title} inProgress={dict.detail.sections.care.inProgress} />
          <PlantSectionPlaceholder title={dict.detail.sections.cycle.title} inProgress={dict.detail.sections.cycle.inProgress} />
          <PlantSectionPlaceholder title={dict.detail.sections.photoHistory.title} inProgress={dict.detail.sections.photoHistory.inProgress} />
          <PlantSectionPlaceholder title={dict.detail.sections.pests.title} inProgress={dict.detail.sections.pests.inProgress} />
        </div>
      </div>
    </div>
  );
}
