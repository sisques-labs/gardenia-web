'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Droplets, MapPin, Pencil, Trash2 } from 'lucide-react';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/shared/presentation/components/ui/tabs/tabs';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { ConfirmDialog } from '@/shared/presentation/components/ui/confirm-dialog/confirm-dialog';
import { Card, CardContent } from '@/shared/presentation/components/ui/card/card';
import { Chip } from '@/shared/presentation/components/ui/chip/chip';
import { usePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook';
import { usePlantingSpotStatusToggle } from '@/core/planting-spots/presentation/hooks/use-planting-spot-status-toggle/use-planting-spot-status-toggle.hook';
import { useWaterPlantingSpotConfirm } from '@/core/planting-spots/presentation/hooks/use-water-planting-spot-confirm/use-water-planting-spot-confirm.hook';
import { useDeletePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-delete-planting-spot/use-delete-planting-spot.hook';
import { useQrDownload } from '@/shared/presentation/hooks/use-qr-download/use-qr-download.hook';
import { QrCard } from '@/shared/presentation/components/qr-card/qr-card';
import { PlantingSpotTypeBadge } from '@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge';
import { PlantingSpotStatusBadge } from '@/core/planting-spots/presentation/components/planting-spot-status-badge/planting-spot-status-badge';
import { AddPlantToSpotModal } from '@/core/planting-spots/presentation/components/add-plant-to-spot-modal/add-plant-to-spot-modal';
import { EditPlantingSpotModal } from '@/core/planting-spots/presentation/components/edit-planting-spot-modal/edit-planting-spot-modal';
import { PlantingSpotDetailSkeleton } from '@/core/planting-spots/presentation/components/planting-spot-detail-skeleton/planting-spot-detail-skeleton';
import { CapacityBar } from '@/core/planting-spots/presentation/components/capacity-bar/capacity-bar';
import { Row } from '@/core/planting-spots/presentation/components/row/row';
import { getPlantingSpotPositionLabel } from '@/core/planting-spots/presentation/utils/get-planting-spot-position-label/get-planting-spot-position-label.util';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['plantingSpots'];
  lang: string;
  spotId: string;
};

export function PlantingSpotDetailScreen({ dict, lang, spotId }: Props) {
  const router = useRouter();
  const { spot, isLoading } = usePlantingSpot(spotId);
  const { isFallow, isPending: isTogglingStatus, toggle: toggleStatus } = usePlantingSpotStatusToggle(
    spotId,
    spot?.status ?? 'ACTIVE',
  );
  const {
    isOpen: isWaterOpen,
    requestWater,
    confirmWater,
    cancelWater,
    result: waterResult,
    isPending: isWaterPending,
    isError: isWaterError,
  } = useWaterPlantingSpotConfirm(spotId);
  const deletePlantingSpot = useDeletePlantingSpot();
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const qrDownload = useQrDownload();
  const d = dict.detail;
  const formDict = dict.form;

  if (isLoading) return <PlantingSpotDetailSkeleton />;
  if (!spot) return null;

  const plantCount = spot.resolvedPlants?.length ?? 0;
  const hasCapacity = spot.capacity != null;
  const positionLabel = getPlantingSpotPositionLabel(spot);

  function handleDeleteConfirm() {
    deletePlantingSpot.mutate(spotId, {
      onSuccess: () => router.push(`/${lang}/planting-spots`),
      onSettled: () => setIsDeleteOpen(false),
    });
  }

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title={spot.name}
        breadcrumbs={[
          { label: dict.list.title, href: `/${lang}/planting-spots` },
          { label: spot.name },
        ]}
      />

      <div className="p-6 flex flex-col gap-6">
        {/* Hero — compact status/actions strip, with the printable QR tag alongside */}
        <Card className="rounded-2xl paper-grain">
          <CardContent className="p-4 lg:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 lg:gap-6 items-start">
              <div className="flex flex-col gap-3 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <PlantingSpotStatusBadge status={spot.status} dict={dict.statuses} />
                  <PlantingSpotTypeBadge type={spot.type} dict={dict.types} />
                  {positionLabel && (
                    <Chip variant="outline">
                      <MapPin className="w-3 h-3" aria-hidden="true" />
                      {positionLabel}
                    </Chip>
                  )}
                  {spot.soilType && <Chip variant="sage">{spot.soilType}</Chip>}
                </div>

                {spot.description && (
                  <p className="text-sm text-muted-foreground">{spot.description}</p>
                )}

                {hasCapacity && (
                  <div className="flex flex-col gap-1.5 max-w-xs">
                    <span className="text-sm text-muted-foreground">
                      {plantCount} / {spot.capacity} {d.plantsCount}
                    </span>
                    <CapacityBar current={plantCount} capacity={spot.capacity!} />
                  </div>
                )}

                <div className="dashed-rule" />

                {/* Action bar */}
                <div data-testid="spot-action-bar" className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isTogglingStatus}
                    onClick={toggleStatus}
                  >
                    {isFallow ? d.markActive : d.markFallow}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="btn-edit-spot"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                    {d.editSpot}
                  </Button>
                  {plantCount > 0 && (
                    <Button
                      variant="default"
                      size="sm"
                      data-testid="btn-water-spot"
                      disabled={isWaterPending}
                      onClick={requestWater}
                    >
                      <Droplets className="w-4 h-4" aria-hidden="true" />
                      {d.waterSpot}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="btn-delete-spot"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                    {formDict.delete}
                  </Button>
                </div>

                {(waterResult || isWaterError) && (
                  <div className="flex flex-col gap-2">
                    {waterResult && (
                      <Alert
                        variant={
                          waterResult.failedPlants.length === 0
                            ? 'success'
                            : waterResult.wateredPlantIds.length === 0
                              ? 'error'
                              : 'warning'
                        }
                        message={
                          waterResult.failedPlants.length === 0
                            ? `${waterResult.wateredPlantIds.length} ${d.waterSpotWatered}.`
                            : `${waterResult.wateredPlantIds.length} ${d.waterSpotWatered}, ${waterResult.failedPlants.length} ${d.waterSpotFailed}.`
                        }
                      />
                    )}
                    {isWaterError && (
                      <Alert variant="error" message={d.waterSpotError} />
                    )}
                  </div>
                )}
              </div>

              {/* QR — the printable pot tag, docked next to the status strip */}
              {spot.qr && (
                <QrCard
                  image={spot.qr.image}
                  code={spot.qr.id}
                  label={d.qr.label}
                  hint={d.qr.hint}
                  downloadLabel={d.qr.download}
                  onDownload={() => qrDownload.download(spot.name, spot.qr)}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="plants">
          <TabsList>
            <TabsTrigger value="plants">{d.tabActivePlants}</TabsTrigger>
            <TabsTrigger value="history">{d.tabRotationHistory}</TabsTrigger>
            <TabsTrigger value="info">{d.tabInfo}</TabsTrigger>
          </TabsList>

          {/* --- Active plants tab --- */}
          <TabsContent value="plants" className="pt-4">
            <div className="flex justify-end pb-3">
              <Button variant="outline" size="sm" onClick={() => setIsAddPlantOpen(true)}>
                {d.addPlant}
              </Button>
            </div>
            {plantCount === 0 ? (
              <p className="text-sm text-muted-foreground">{d.noActivePlants}</p>
            ) : (
              <div className="flex flex-col divide-y divide-border rounded-lg border overflow-hidden">
                {spot.resolvedPlants.map((plant) => (
                  <div key={plant.id} className="flex items-center gap-3 px-4 py-3">
                    {plant.imageUrl ? (
                      <Image
                        src={plant.imageUrl}
                        alt={plant.name}
                        width={36}
                        height={36}
                        unoptimized
                        className="h-9 w-9 rounded-md object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">🌱</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{plant.name}</p>
                      {plant.plantSpeciesId && (
                        <p className="text-xs text-muted-foreground truncate">{plant.plantSpeciesId}</p>
                      )}
                    </div>
                    <Link
                      href={`/${lang}/plants/${plant.id}`}
                      className="text-xs text-[var(--forest)] hover:underline"
                    >
                      {d.viewPlant}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- Rotation history tab --- */}
          <TabsContent value="history" className="pt-4">
            {plantCount === 0 ? (
              <p className="text-sm text-muted-foreground">{d.rotationHistoryEmpty}</p>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wide">
                        <th className="px-4 py-2 text-left">{d.plantColumn}</th>
                        <th className="px-4 py-2 text-left">{d.addedColumn}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {spot.resolvedPlants.map((plant) => (
                        <tr key={plant.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{plant.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(plant.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* --- Info tab --- */}
          <TabsContent value="info" className="pt-4">
            <div className="flex flex-col gap-3 max-w-sm">
              <Row label={d.infoStatus}>
                <PlantingSpotStatusBadge status={spot.status} dict={dict.statuses} />
              </Row>

              <Row label={d.infoType}>
                <PlantingSpotTypeBadge type={spot.type} dict={dict.types} />
              </Row>

              {spot.description && (
                <Row label={d.infoDescription}>
                  <span className="text-sm">{spot.description}</span>
                </Row>
              )}

              <Row label={d.infoCapacity}>
                <span className="text-sm">
                  {hasCapacity ? `${spot.capacity} ${d.plantsCount}` : d.noLimit}
                </span>
              </Row>

              <Row label={d.position}>
                <span className="text-sm">
                  {positionLabel ?? d.notSet}
                </span>
              </Row>

              {spot.dimensionsWidth != null && (
                <Row label={d.infoDimensionsWidth}>
                  <span className="text-sm">{spot.dimensionsWidth}</span>
                </Row>
              )}
              {spot.dimensionsHeight != null && (
                <Row label={d.infoDimensionsHeight}>
                  <span className="text-sm">{spot.dimensionsHeight}</span>
                </Row>
              )}
              {spot.dimensionsLength != null && (
                <Row label={d.infoDimensionsLength}>
                  <span className="text-sm">{spot.dimensionsLength}</span>
                </Row>
              )}

              {spot.soilType && (
                <Row label={d.infoSoilType}>
                  <span className="text-sm">{spot.soilType}</span>
                </Row>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {isAddPlantOpen && (
        <AddPlantToSpotModal
          spotId={spotId}
          dict={dict.addPlantModal}
          onClose={() => setIsAddPlantOpen(false)}
        />
      )}

      {isEditOpen && (
        <EditPlantingSpotModal
          spot={spot}
          dict={dict}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      <ConfirmDialog
        open={isWaterOpen}
        onOpenChange={(open) => !open && cancelWater()}
        title={d.waterSpotConfirmTitle}
        description={d.waterSpotConfirmDescription}
        confirmLabel={d.waterSpotConfirm}
        cancelLabel={d.waterSpotCancel}
        onConfirm={confirmWater}
        onCancel={cancelWater}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={formDict.delete}
        description={formDict.deleteConfirm}
        confirmLabel={formDict.delete}
        cancelLabel={formDict.cancel}
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
