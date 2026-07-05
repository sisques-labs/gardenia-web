import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import homeDict from '@/core/home/presentation/i18n/en';
import plantingSpotsDict from '@/core/planting-spots/presentation/i18n/en';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockUsePlantingSpots = vi.fn();

vi.mock('@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook', () => ({
  usePlantingSpots: (...args: unknown[]) => mockUsePlantingSpots(...args),
}));

import { PlantingSpotsSummarySection } from './planting-spots-summary-section';

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

describe('PlantingSpotsSummarySection', () => {
  it('shows the empty state when there are no planting spots', () => {
    mockUsePlantingSpots.mockReturnValue({ spots: [], isLoading: false });
    render(<PlantingSpotsSummarySection dict={homeDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText(homeDict.sections.plantingSpotsSummary.empty)).toBeInTheDocument();
  });

  it('shows active vs fallow counts and a breakdown by type', () => {
    mockUsePlantingSpots.mockReturnValue({
      spots: [
        spot('s1', 'RAISED_BED', 'ACTIVE'),
        spot('s2', 'RAISED_BED', 'ACTIVE'),
        spot('s3', 'POT', 'FALLOW'),
      ],
      isLoading: false,
    });
    render(<PlantingSpotsSummarySection dict={homeDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(`${plantingSpotsDict.types.RAISED_BED} · 2`)).toBeInTheDocument();
    expect(screen.getByText(`${plantingSpotsDict.types.POT} · 1`)).toBeInTheDocument();
  });
});
