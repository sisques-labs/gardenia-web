'use client';

import Link from 'next/link';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/shared/presentation/components/ui/tabs/tabs';
import { Button, buttonVariants } from '@/shared/presentation/components/ui/button/button';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { ConfirmDialog } from '@/shared/presentation/components/ui/confirm-dialog/confirm-dialog';
import { usePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook';
import { useWaterPlantingSpotConfirm } from '@/core/planting-spots/presentation/hooks/use-water-planting-spot-confirm/use-water-planting-spot-confirm.hook';
import { PlantingSpotTypeBadge } from '@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge';
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
  const { spot, isLoading } = usePlantingSpot(spotId);
  const {
    isOpen: isWaterOpen,
    requestWater,
    confirmWater,
    cancelWater,
    result: waterResult,
    isPending: isWaterPending,
    isError: isWaterError,
  } = useWaterPlantingSpotConfirm(spotId);
  const d = dict.detail;

  if (isLoading) return <PlantingSpotDetailSkeleton />;
  if (!spot) return null;

  const plantCount = spot.resolvedPlants?.length ?? 0;
  const hasCapacity = spot.capacity != null;
  const positionLabel = getPlantingSpotPositionLabel(spot);

  return (
    <div>
      <ScreenHeader
        title={spot.name}
        breadcrumbs={[
          { label: dict.list.title, href: `/${lang}/planting-spots` },
          { label: spot.name },
        ]}
        actions={
          <>
            <Link
              href={`/${lang}/planting-spots/${spotId}/edit`}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {d.editSpot}
            </Link>
            {plantCount > 0 && (
              <Button
                variant="default"
                size="sm"
                data-testid="btn-water-spot"
                disabled={isWaterPending}
                onClick={requestWater}
              >
                {d.waterSpot}
              </Button>
            )}
          </>
        }
      />

      {(waterResult || isWaterError) && (
        <div className="px-6 pt-4 flex flex-col gap-2">
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

      {/* Capacity summary bar */}
      {hasCapacity && (
        <div className="px-6 pt-4 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {plantCount} / {spot.capacity} {d.plantsCount}
            </span>
            {positionLabel && (
              <span className="text-xs text-muted-foreground">{d.position}: {positionLabel}</span>
            )}
          </div>
          <CapacityBar current={plantCount} capacity={spot.capacity!} />
        </div>
      )}

      <div className="px-6 pt-4">
        <Tabs defaultValue="plants">
          <TabsList>
            <TabsTrigger value="plants">{d.tabActivePlants}</TabsTrigger>
            <TabsTrigger value="history">{d.tabRotationHistory}</TabsTrigger>
            <TabsTrigger value="info">{d.tabInfo}</TabsTrigger>
          </TabsList>

          {/* --- Active plants tab --- */}
          <TabsContent value="plants" className="pt-4">
            {plantCount === 0 ? (
              <p className="text-sm text-muted-foreground">{d.noActivePlants}</p>
            ) : (
              <div className="flex flex-col divide-y divide-border rounded-lg border overflow-hidden">
                {spot.resolvedPlants.map((plant) => (
                  <div key={plant.id} className="flex items-center gap-3 px-4 py-3">
                    {plant.imageUrl ? (
                      <img
                        src={plant.imageUrl}
                        alt={plant.name}
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
                      Ver
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
                        <th className="px-4 py-2 text-left">Planta</th>
                        <th className="px-4 py-2 text-left">Añadida</th>
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
    </div>
  );
}
