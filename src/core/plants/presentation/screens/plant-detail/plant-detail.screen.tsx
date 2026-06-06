'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Camera, StickyNote } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button';
import { Card, CardContent } from '@/shared/presentation/components/ui/card';
import { Chip } from '@/shared/presentation/components/ui/chip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/presentation/components/ui/tabs';
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
      {/* Breadcrumb nav */}
      <ScreenHeader
        title={plant.name}
        breadcrumbs={[
          { label: dict.detail.breadcrumbList, href: `/${lang}/plants` },
          { label: plant.name },
        ]}
      />

      <div className="p-6 flex flex-col gap-6">
        {/* 3-column header grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column — Plant image */}
          <div
            data-testid="plant-image"
            className="aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center"
          >
            {plant.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={plant.imageUrl}
                alt={plant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="placeholder-img paper-grain flex items-center justify-center w-full h-full">
                <span className="text-muted-foreground text-sm text-center px-2">{plant.name}</span>
              </div>
            )}
          </div>

          {/* Center column — Identity + Chips + Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                BANCAL · {plant.spaceId}
              </p>
              <h1
                data-testid="plant-name"
                className="headline text-3xl font-serif"
              >
                {plant.name}
              </h1>
              {plant.species?.name && (
                <p
                  data-testid="plant-species"
                  className="text-sm text-muted-foreground italic"
                >
                  {plant.species.name}
                </p>
              )}
            </div>

            {/* Chips row */}
            <div className="flex flex-wrap gap-2">
              {plant.species?.name && (
                <Chip variant="sage" data-testid="chip-species">
                  {plant.species.name}
                </Chip>
              )}
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                data-testid="btn-mark-watered"
              >
                <Droplets className="w-4 h-4" />
                {dict.detail.actions.markWatered}
              </Button>
              <Button
                variant="outline"
                size="sm"
                data-testid="btn-add-photo"
              >
                <Camera className="w-4 h-4" />
                {dict.detail.actions.addPhoto}
              </Button>
              <Button
                variant="outline"
                size="sm"
                data-testid="btn-new-note"
              >
                <StickyNote className="w-4 h-4" />
                {dict.detail.actions.newNote}
              </Button>
            </div>
          </div>

          {/* Right column — QR Card */}
          {plant.qr && (
            <Card data-testid="qr-card">
              <CardContent className="flex flex-col gap-3 pt-6">
                <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dict.detail.qr.label}
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-testid="qr-image"
                  src={`data:image/png;base64,${plant.qr.image}`}
                  alt="QR"
                  className="w-24 h-24 mx-auto"
                />
                <p
                  data-testid="qr-code"
                  className="text-xs text-center text-muted-foreground font-mono"
                >
                  {plant.qr.id}
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  {dict.detail.qr.hint}
                </p>
                <Button
                  disabled
                  variant="ghost"
                  size="sm"
                  data-testid="btn-download-pdf"
                  className="text-xs text-[var(--forest)] w-full"
                >
                  {dict.detail.qr.download}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tab nav */}
        <Tabs defaultValue="care">
          <TabsList variant="line" className="w-full justify-start border-b rounded-none h-auto pb-0">
            <TabsTrigger value="care">{dict.detail.tabs.care}</TabsTrigger>
            <TabsTrigger value="calendar" disabled>{dict.detail.tabs.calendar}</TabsTrigger>
            <TabsTrigger value="associations" disabled>{dict.detail.tabs.associations}</TabsTrigger>
          </TabsList>

          <TabsContent value="care">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <PlantSectionPlaceholder title={dict.detail.sections.care.title} inProgress={dict.detail.sections.care.inProgress} />
              <PlantSectionPlaceholder title={dict.detail.sections.cycle.title} inProgress={dict.detail.sections.cycle.inProgress} />
              <PlantSectionPlaceholder title={dict.detail.sections.photoHistory.title} inProgress={dict.detail.sections.photoHistory.inProgress} />
              <PlantSectionPlaceholder title={dict.detail.sections.pests.title} inProgress={dict.detail.sections.pests.inProgress} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
