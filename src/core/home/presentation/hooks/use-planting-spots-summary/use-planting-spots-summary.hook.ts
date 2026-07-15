import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import type { PlantingSpotType } from '@/core/planting-spots/domain/types/planting-spot-type.type';

const SUMMARY_PAGE_SIZE = 100;

export function usePlantingSpotsSummary() {
  const { spots, isLoading } = usePlantingSpots(1, SUMMARY_PAGE_SIZE);

  const activeCount = spots.filter((spot) => spot.status === 'ACTIVE').length;
  const fallowCount = spots.filter((spot) => spot.status === 'FALLOW').length;

  const countByType = spots.reduce<Partial<Record<PlantingSpotType, number>>>((acc, spot) => {
    acc[spot.type] = (acc[spot.type] ?? 0) + 1;
    return acc;
  }, {});

  return { spots, isLoading, activeCount, fallowCount, countByType };
}
