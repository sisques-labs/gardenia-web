"use client";

import { useAuthStore } from "@/core/auth/infrastructure/store/auth.store";
import { CareLogActivityType } from "@/core/care-log/domain/interfaces/care-log-entry.interface";
import { CareLogSummary } from "@/core/care-log/presentation/components/care-log-summary/care-log-summary";
import { usePlantCareLogs } from "@/core/care-log/presentation/hooks/use-plant-care-logs/use-plant-care-logs.hook";
import { CareScheduleList } from "@/core/care-schedule/presentation/components/care-schedule-list/care-schedule-list";
import { useWaterPlant } from "@/core/care-schedule/presentation/hooks/use-water-plant/use-water-plant.hook";
import { PlantPhotoGallery } from "@/core/plant-photos/presentation/components/plant-photo-gallery/plant-photo-gallery";
import { EditPlantModal } from "@/core/plants/presentation/components/edit-plant-modal/edit-plant-modal";
import { PlantDetailSkeleton } from "@/core/plants/presentation/components/plant-detail-skeleton/plant-detail-skeleton";
import { PlantPlantingSpotField } from "@/core/plants/presentation/components/plant-planting-spot-field/plant-planting-spot-field";
import { useDeletePlant } from "@/core/plants/presentation/hooks/use-delete-plant/use-delete-plant.hook";
import { usePlant } from "@/core/plants/presentation/hooks/use-plant/use-plant.hook";
import { useQrDownload } from "@/shared/presentation/hooks/use-qr-download/use-qr-download.hook";
import { QrCard } from "@/shared/presentation/components/qr-card/qr-card";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import { formatRelativeTime } from "@/shared/lib/format-relative-time";
import { ScreenHeader } from "@/shared/presentation/components/screen-header/screen-header";
import { Alert } from "@/shared/presentation/components/ui/alert/alert";
import { Button } from "@/shared/presentation/components/ui/button/button";
import {
  Card,
  CardContent,
} from "@/shared/presentation/components/ui/card/card";
import { Chip } from "@/shared/presentation/components/ui/chip/chip";
import { ConfirmDialog } from "@/shared/presentation/components/ui/confirm-dialog/confirm-dialog";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";
import { formatShortDate } from "@/shared/presentation/utils/format-short-date.util";
import { getAuthenticatedImageUrl } from "@/shared/presentation/utils/get-authenticated-image-url.util";
import {
  CalendarDays,
  Droplets,
  MapPin,
  Pencil,
  Sprout,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  dict: AppDict["plants"];
  careLogDict: AppDict["careLog"];
  careScheduleDict: AppDict["careSchedule"];
  photosDict: AppDict["plantPhotos"];
  lang: string;
  spaceId: string | null;
  plantId: string;
};

export function PlantDetailScreen({
  dict,
  careLogDict,
  careScheduleDict,
  photosDict,
  lang,
  spaceId: spaceIdProp,
  plantId,
}: Props) {
  const router = useRouter();
  const storeSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const spaceId = spaceIdProp ?? storeSpaceId;
  const { data: plant, isLoading, isError } = usePlant(spaceId, plantId);
  const { data: lastCareByType = {} } = usePlantCareLogs(plantId);
  const deletePlant = useDeletePlant(spaceId);
  const waterPlant = useWaterPlant();
  const qrDownload = useQrDownload();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  if (isLoading) return <PlantDetailSkeleton />;
  if (isError) redirect(`/${lang}/plants`);
  if (!plant) return null;

  const imageSrc = getAuthenticatedImageUrl(plant.imageUrl, accessToken, spaceId);

  const lastWatered = lastCareByType[CareLogActivityType.WATERING];
  const wateredLabel = lastWatered
    ? formatRelativeTime(lastWatered.performedAt, lang)
    : dict.detail.care.neverWatered;

  function handleDeleteConfirm() {
    deletePlant.mutate(plantId, {
      onSuccess: () => router.push(`/${lang}/plants`),
      onSettled: () => setIsDeleteOpen(false),
    });
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={plant.name}
        breadcrumbs={[
          { label: dict.detail.breadcrumbList, href: `/${lang}/plants` },
          { label: plant.name },
        ]}
      />

      <div className="p-6 flex flex-col gap-8">
        {/* Hero — the plant's specimen sheet */}
        <Card className="rounded-3xl paper-grain">
          <CardContent className="p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,300px)_1fr_auto] gap-8 lg:gap-10 items-start">
              {/* Image, with a hanging "watered" tag */}
              <div className="relative">
                <div
                  data-testid="plant-image"
                  className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-[var(--rule)] shadow-md"
                >
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={plant.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 300px"
                      unoptimized
                    />
                  ) : (
                    <div className="placeholder-img leaf flex flex-col items-center justify-center gap-2 w-full h-full">
                      <Sprout
                        className="w-8 h-8 text-[var(--forest-2)]"
                        aria-hidden="true"
                      />
                      <span className="text-center px-2">{plant.name}</span>
                    </div>
                  )}
                </div>
                <div
                  data-testid="plant-last-watered"
                  aria-label={`${dict.detail.care.lastWatered}: ${wateredLabel}`}
                  className="absolute -bottom-3 left-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--rule)] bg-[var(--paper)] px-3 py-1.5 text-xs font-medium shadow-md w-fit max-w-[calc(100%-1.5rem)]"
                >
                  <Droplets
                    className="w-3.5 h-3.5 text-[var(--forest)] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{wateredLabel}</span>
                </div>
              </div>

              {/* Identity + chips + actions */}
              <div className="flex flex-col gap-4 min-w-0 pt-1">
                <div className="flex flex-col gap-1">
                  <h1
                    data-testid="plant-name"
                    className="headline text-4xl lg:text-5xl tracking-tight"
                  >
                    {plant.name}
                  </h1>
                  {plant.species?.scientificName && (
                    <p
                      data-testid="plant-species"
                      className="text-base text-muted-foreground italic"
                    >
                      {plant.species.scientificName}
                    </p>
                  )}
                  <p
                    className="text-base text-[var(--terracotta)] mt-0.5"
                    style={{ fontFamily: "var(--font-hand)" }}
                  >
                    {dict.detail.addedOn}{" "}
                    {formatShortDate(plant.createdAt, lang)}
                  </p>
                  {plant.species?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {plant.species.description}
                    </p>
                  )}
                </div>

                {/* Chips row */}
                <div className="flex flex-wrap gap-2">
                  {plant.species?.scientificName && (
                    <Chip variant="sage" data-testid="chip-species">
                      {plant.species.scientificName}
                    </Chip>
                  )}
                  {plant.plantingSpot && (
                    <Chip variant="outline" data-testid="chip-planting-spot">
                      <MapPin className="w-3 h-3" aria-hidden="true" />
                      {plant.plantingSpot.name}
                    </Chip>
                  )}
                </div>

                <PlantPlantingSpotField
                  plantId={plantId}
                  currentSpotId={plant.plantingSpot?.id}
                  dict={dict.detail.plantingSpot}
                />

                <div className="dashed-rule" />

                {/* Action bar */}
                <div
                  data-testid="plant-action-bar"
                  className="flex flex-wrap gap-2"
                >
                  <Button
                    variant="default"
                    size="sm"
                    loading={waterPlant.isPending}
                    data-testid="btn-mark-watered"
                    className="shadow-sm"
                    onClick={() => waterPlant.mutate({ plantId })}
                  >
                    <Droplets className="w-4 h-4" />
                    {dict.detail.actions.markWatered}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="btn-edit-plant"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Pencil className="w-4 h-4" />
                    {dict.detail.actions.edit}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="btn-delete-plant"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    {dict.delete.button}
                  </Button>
                </div>
                {waterPlant.isError && (
                  <Alert
                    variant="error"
                    message={dict.detail.actions.markWateredError}
                  />
                )}
                {deletePlant.isError && (
                  <Alert variant="error" message={dict.delete.error} />
                )}

                <PlantPhotoGallery plantId={plantId} lang={lang} dict={photosDict} />
              </div>

              {/* QR — rendered like the printable pot tag it actually is */}
              {plant.qr && (
                <QrCard
                  image={plant.qr.image}
                  code={plant.qr.id}
                  label={dict.detail.qr.label}
                  hint={dict.detail.qr.hint}
                  downloadLabel={dict.detail.qr.download}
                  onDownload={() => qrDownload.download(plant.name, plant.qr)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Care + calendar sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card
            data-testid="care-log-section"
            className="rounded-2xl border-l-4 border-l-[var(--forest)] transition-shadow duration-200 hover:shadow-md"
          >
            s{" "}
            <CardContent className="pt-6">
              <CareLogSummary
                lastCareByType={lastCareByType}
                dict={careLogDict}
                lang={lang}
              />
            </CardContent>
          </Card>

          <Card
            data-testid="care-schedule-section"
            className="rounded-2xl border-l-4 border-l-[var(--honey)] transition-shadow duration-200 hover:shadow-md"
          >
            <CardContent className="pt-6">
              <CareScheduleList
                plantId={plantId}
                dict={careScheduleDict}
                title={
                  <>
                    <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
                    {dict.detail.calendarTitle}
                  </>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {isEditOpen && (
        <EditPlantModal
          plant={{ id: plant.id, name: plant.name, imageUrl: plant.imageUrl }}
          dict={dict.edit}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={dict.delete.confirmTitle}
        description={dict.delete.confirmDescription}
        confirmLabel={dict.delete.confirm}
        cancelLabel={dict.delete.cancel}
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
