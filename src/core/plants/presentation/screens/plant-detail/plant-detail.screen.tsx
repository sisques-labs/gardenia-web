"use client";

import { CareLogSummary } from "@/core/care-log/presentation/components/care-log-summary/care-log-summary";
import { usePlantCareLogs } from "@/core/care-log/presentation/hooks/use-plant-care-logs/use-plant-care-logs.hook";
import { CareScheduleList } from "@/core/care-schedule/presentation/components/care-schedule-list/care-schedule-list";
import { PlantDetailSkeleton } from "@/core/plants/presentation/components/plant-detail-skeleton/plant-detail-skeleton";
import { useDeletePlant } from "@/core/plants/presentation/hooks/use-delete-plant/use-delete-plant.hook";
import { usePlant } from "@/core/plants/presentation/hooks/use-plant/use-plant.hook";
import { useSpacesStore } from "@/core/spaces/infrastructure/store/spaces.store";
import { InDevelopment } from "@/shared/presentation/components/in-development/in-development";
import { ScreenHeader } from "@/shared/presentation/components/screen-header/screen-header";
import { Alert } from "@/shared/presentation/components/ui/alert/alert";
import { Button } from "@/shared/presentation/components/ui/button/button";
import {
  Card,
  CardContent,
} from "@/shared/presentation/components/ui/card/card";
import { Chip } from "@/shared/presentation/components/ui/chip/chip";
import { ConfirmDialog } from "@/shared/presentation/components/ui/confirm-dialog/confirm-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/presentation/components/ui/tabs/tabs";
import type { AppDict } from "@/shared/presentation/i18n/get-dictionary";
import { Camera, Droplets, StickyNote, Trash2 } from "lucide-react";
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (isLoading) return <PlantDetailSkeleton />;
  if (isError) redirect(`/${lang}/plants`);
  if (!plant) return null;

  function handleDeleteConfirm() {
    deletePlant.mutate(plantId, {
      onSuccess: () => router.push(`/${lang}/plants`),
      onSettled: () => setIsDeleteOpen(false),
    });
  }

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
            className="relative aspect-square rounded-xl overflow-hidden bg-muted flex items-center justify-center"
          >
            {plant.imageUrl ? (
              <Image
                src={plant.imageUrl}
                alt={plant.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="placeholder-img paper-grain flex items-center justify-center w-full h-full">
                <span className="text-muted-foreground text-sm text-center px-2">
                  {plant.name}
                </span>
              </div>
            )}
          </div>

          {/* Center column — Identity + Chips + Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="eyebrow text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {dict.detail.bancal} · {plant.spaceId}
              </p>
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
            </div>

            {/* Chips row */}
            <div className="flex flex-wrap gap-2">
              {plant.species?.scientificName && (
                <Chip variant="sage" data-testid="chip-species">
                  {plant.species.scientificName}
                </Chip>
              )}
            </div>

            {/* Action bar */}
            <div
              data-testid="plant-action-bar"
              className="flex flex-wrap gap-2"
            >
              <Button
                variant="default"
                size="sm"
                data-testid="btn-mark-watered"
              >
                <Droplets className="w-4 h-4" />
                {dict.detail.actions.markWatered}
              </Button>
              <Button variant="outline" size="sm" data-testid="btn-add-photo">
                <Camera className="w-4 h-4" />
                {dict.detail.actions.addPhoto}
              </Button>
              <Button variant="outline" size="sm" data-testid="btn-new-note">
                <StickyNote className="w-4 h-4" />
                {dict.detail.actions.newNote}
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
            {deletePlant.isError && (
              <Alert variant="error" message={dict.delete.error} />
            )}
          </div>

          {/* Right column — QR Card */}
          {plant.qr && (
            <Card data-testid="plant-qr-card">
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

        {/* Tab nav */}
        <Tabs defaultValue="care">
          <TabsList
            variant="line"
            className="w-full justify-start border-b rounded-none h-auto pb-0"
          >
            <TabsTrigger value="care">{dict.detail.tabs.care}</TabsTrigger>
            <TabsTrigger value="calendar">
              {dict.detail.tabs.calendar}
            </TabsTrigger>
            <TabsTrigger value="diary">{dict.detail.tabs.diary}</TabsTrigger>
            <TabsTrigger value="harvests">
              {dict.detail.tabs.harvests}
            </TabsTrigger>
            <TabsTrigger value="pests">{dict.detail.tabs.pests}</TabsTrigger>
            <TabsTrigger value="associations">
              {dict.detail.tabs.associations}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="care">
            <div className="pt-6">
              <CareLogSummary
                lastCareByType={lastCareByType}
                dict={careLogDict}
                lang={lang}
              />
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <CareScheduleList plantId={plantId} dict={careScheduleDict} />
          </TabsContent>

          <TabsContent value="diary">
            <InDevelopment />
          </TabsContent>

          <TabsContent value="harvests">
            <InDevelopment />
          </TabsContent>

          <TabsContent value="pests">
            <InDevelopment />
          </TabsContent>

          <TabsContent value="associations">
            <InDevelopment />
          </TabsContent>
        </Tabs>
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
