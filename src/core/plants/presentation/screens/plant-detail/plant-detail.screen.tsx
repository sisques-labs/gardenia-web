"use client";

import { CareLogActivityType } from "@/core/care-log/domain/interfaces/care-log-entry.interface";
import { CareLogSummary } from "@/core/care-log/presentation/components/care-log-summary/care-log-summary";
import { useCreateCareLog } from "@/core/care-log/presentation/hooks/use-create-care-log/use-create-care-log.hook";
import { usePlantCareLogs } from "@/core/care-log/presentation/hooks/use-plant-care-logs/use-plant-care-logs.hook";
import { CareScheduleList } from "@/core/care-schedule/presentation/components/care-schedule-list/care-schedule-list";
import { PlantDetailSkeleton } from "@/core/plants/presentation/components/plant-detail-skeleton/plant-detail-skeleton";
import { useDeletePlant } from "@/core/plants/presentation/hooks/use-delete-plant/use-delete-plant.hook";
import { usePlant } from "@/core/plants/presentation/hooks/use-plant/use-plant.hook";
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
import { Droplets, MapPin, Trash2 } from "lucide-react";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  dict: AppDict["plants"];
  careLogDict: AppDict["careLog"];
  careScheduleDict: AppDict["careSchedule"];
  lang: string;
  spaceId: string | null;
  plantId: string;
};

export function PlantDetailScreen({
  dict,
  careLogDict,
  careScheduleDict,
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
  const markWatered = useCreateCareLog(plantId);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) return <PlantDetailSkeleton />;
  if (isError) redirect(`/${lang}/plants`);
  if (!plant) return null;

  const lastWatered = lastCareByType[CareLogActivityType.WATERING];

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
        {/* Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr_auto] gap-6 items-start">
          {/* Image */}
          <div
            data-testid="plant-image"
            className="relative aspect-square rounded-2xl overflow-hidden bg-muted ring-1 ring-[var(--rule)] flex items-center justify-center"
          >
            {plant.imageUrl ? (
              <Image
                src={plant.imageUrl}
                alt={plant.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 320px"
              />
            ) : (
              <div className="placeholder-img paper-grain flex items-center justify-center w-full h-full">
                <span className="text-muted-foreground text-sm text-center px-2">
                  {plant.name}
                </span>
              </div>
            )}
          </div>

          {/* Identity + chips + actions */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="flex flex-col gap-1">
              <h1
                data-testid="plant-name"
                className="headline text-3xl font-serif"
              >
                {plant.name}
              </h1>
              {plant.species?.scientificName && (
                <p
                  data-testid="plant-species"
                  className="text-sm text-muted-foreground italic"
                >
                  {plant.species.scientificName}
                </p>
              )}
              {plant.species?.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
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

            {/* Last watered quick stat */}
            <div
              data-testid="plant-last-watered"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Droplets
                className="w-4 h-4 text-[var(--forest)]"
                aria-hidden="true"
              />
              {lastWatered
                ? `${dict.detail.care.lastWatered} · ${formatRelativeTime(lastWatered.performedAt, lang)}`
                : dict.detail.care.neverWatered}
            </div>

            {/* Action bar */}
            <div
              data-testid="plant-action-bar"
              className="flex flex-wrap gap-2"
            >
              <Button
                variant="default"
                size="sm"
                loading={markWatered.isPending}
                data-testid="btn-mark-watered"
                onClick={() =>
                  markWatered.mutate({
                    plantId,
                    activityType: CareLogActivityType.WATERING,
                  })
                }
              >
                <Droplets className="w-4 h-4" />
                {dict.detail.actions.markWatered}
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
            {markWatered.isError && (
              <Alert variant="error" message={dict.detail.actions.markWateredError} />
            )}
            {deletePlant.isError && (
              <Alert variant="error" message={dict.delete.error} />
            )}
          </div>

          {/* QR Card */}
          {plant.qr && (
            <Card data-testid="plant-qr-card" className="w-full lg:w-56">
              <CardContent className="flex flex-col gap-3 pt-6">
                <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {dict.detail.qr.label}
                </p>
                <Image
                  data-testid="qr-image"
                  src={`data:image/png;base64,${plant.qr.image}`}
                  alt="QR"
                  width={96}
                  height={96}
                  unoptimized
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
                  data-testid="qr-download-btn"
                  className="text-xs text-[var(--forest)] w-full"
                >
                  {dict.detail.qr.download}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Care + calendar sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <Card data-testid="care-log-section">
            <CardContent className="pt-6">
              <CareLogSummary
                lastCareByType={lastCareByType}
                dict={careLogDict}
                lang={lang}
              />
            </CardContent>
          </Card>

          <Card data-testid="care-schedule-section">
            <CardContent className="pt-6 flex flex-col gap-3">
              <p className="eyebrow">{dict.detail.calendarTitle}</p>
              <CareScheduleList plantId={plantId} dict={careScheduleDict} />
            </CardContent>
          </Card>
        </div>
      </div>

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
