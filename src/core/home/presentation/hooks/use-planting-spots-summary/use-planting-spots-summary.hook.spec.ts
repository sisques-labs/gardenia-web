import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockUsePlantingSpots = vi.fn();

vi.mock('@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook', () => ({
  usePlantingSpots: (...args: unknown[]) => mockUsePlantingSpots(...args),
}));

import { usePlantingSpotsSummary } from './use-planting-spots-summary.hook';

function spot(id: string, type: PlantingSpot['type'], status: PlantingSpot['status']): PlantingSpot {
  return {
    id,
    name: id,
    type,
    status,
    userId: 'u1',
    spaceId: 'space-1',
    resolvedPlants: [],
    createdAt: '2026-05-01',
    updatedAt: '2026-05-01',
  };
}

describe('usePlantingSpotsSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests a large page from usePlantingSpots so the summary covers the whole space', () => {
    mockUsePlantingSpots.mockReturnValue({ spots: [], isLoading: false });
    renderHook(() => usePlantingSpotsSummary());
    expect(mockUsePlantingSpots).toHaveBeenCalledWith(1, 100);
  });

  it('returns zeroed counts while loading', () => {
    mockUsePlantingSpots.mockReturnValue({ spots: [], isLoading: true });
    const { result } = renderHook(() => usePlantingSpotsSummary());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.activeCount).toBe(0);
    expect(result.current.fallowCount).toBe(0);
    expect(result.current.countByType).toEqual({});
  });

  it('counts active vs fallow spots', () => {
    mockUsePlantingSpots.mockReturnValue({
      spots: [
        spot('s1', 'RAISED_BED', 'ACTIVE'),
        spot('s2', 'RAISED_BED', 'ACTIVE'),
        spot('s3', 'POT', 'FALLOW'),
      ],
      isLoading: false,
    });
    const { result } = renderHook(() => usePlantingSpotsSummary());
    expect(result.current.activeCount).toBe(2);
    expect(result.current.fallowCount).toBe(1);
  });

  it('groups spots by type', () => {
    mockUsePlantingSpots.mockReturnValue({
      spots: [
        spot('s1', 'RAISED_BED', 'ACTIVE'),
        spot('s2', 'RAISED_BED', 'ACTIVE'),
        spot('s3', 'POT', 'FALLOW'),
      ],
      isLoading: false,
    });
    const { result } = renderHook(() => usePlantingSpotsSummary());
    expect(result.current.countByType).toEqual({ RAISED_BED: 2, POT: 1 });
  });
});
