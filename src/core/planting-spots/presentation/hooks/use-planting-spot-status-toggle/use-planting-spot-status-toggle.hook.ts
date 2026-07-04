import { useMarkPlantingSpotFallow } from '@/core/planting-spots/presentation/hooks/use-mark-planting-spot-fallow/use-mark-planting-spot-fallow.hook';
import { useMarkPlantingSpotActive } from '@/core/planting-spots/presentation/hooks/use-mark-planting-spot-active/use-mark-planting-spot-active.hook';
import type { PlantingSpotStatus } from '@/core/planting-spots/domain/types/planting-spot-status.type';

export function usePlantingSpotStatusToggle(spotId: string, status: PlantingSpotStatus) {
  const markFallow = useMarkPlantingSpotFallow();
  const markActive = useMarkPlantingSpotActive();
  const isFallow = status === 'FALLOW';

  return {
    isFallow,
    isPending: markFallow.isPending || markActive.isPending,
    toggle: () => (isFallow ? markActive.mutate(spotId) : markFallow.mutate(spotId)),
  };
}
