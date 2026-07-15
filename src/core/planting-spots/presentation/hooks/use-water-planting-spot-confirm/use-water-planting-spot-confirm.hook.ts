import { useState } from 'react';
import { useWaterPlantingSpot } from '@/core/planting-spots/presentation/hooks/use-water-planting-spot/use-water-planting-spot.hook';
import type { WaterPlantingSpotResult } from '@/core/planting-spots/domain/interfaces/water-planting-spot-result.interface';

export function useWaterPlantingSpotConfirm(spotId: string) {
  const waterPlantingSpot = useWaterPlantingSpot();
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState<WaterPlantingSpotResult | null>(null);

  function requestWater() {
    setIsOpen(true);
  }

  function confirmWater() {
    waterPlantingSpot.mutate(
      { id: spotId },
      {
        onSuccess: (r) => setResult(r),
        onSettled: () => setIsOpen(false),
      },
    );
  }

  function cancelWater() {
    setIsOpen(false);
  }

  return {
    isOpen,
    requestWater,
    confirmWater,
    cancelWater,
    result,
    isPending: waterPlantingSpot.isPending,
    isError: waterPlantingSpot.isError,
  };
}
