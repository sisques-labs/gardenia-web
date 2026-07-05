import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import homeDict from '@/core/home/presentation/i18n/en';
import plantingSpotsDict from '@/core/planting-spots/presentation/i18n/en';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockUsePlantingSpotsSummary = vi.fn();

vi.mock('@/core/home/presentation/hooks/use-planting-spots-summary/use-planting-spots-summary.hook', () => ({
  usePlantingSpotsSummary: () => mockUsePlantingSpotsSummary(),
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
    mockUsePlantingSpotsSummary.mockReturnValue({
      spots: [],
      isLoading: false,
      activeCount: 0,
      fallowCount: 0,
      countByType: {},
    });
    render(<PlantingSpotsSummarySection dict={homeDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText(homeDict.sections.plantingSpotsSummary.empty)).toBeInTheDocument();
  });

  it('shows active vs fallow counts and a breakdown by type', () => {
    mockUsePlantingSpotsSummary.mockReturnValue({
      spots: [spot('s1', 'RAISED_BED', 'ACTIVE'), spot('s2', 'RAISED_BED', 'ACTIVE'), spot('s3', 'POT', 'FALLOW')],
      isLoading: false,
      activeCount: 2,
      fallowCount: 1,
      countByType: { RAISED_BED: 2, POT: 1 },
    });
    render(<PlantingSpotsSummarySection dict={homeDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(`${plantingSpotsDict.types.RAISED_BED} · 2`)).toBeInTheDocument();
    expect(screen.getByText(`${plantingSpotsDict.types.POT} · 1`)).toBeInTheDocument();
  });

  it('shows the skeleton while loading', () => {
    mockUsePlantingSpotsSummary.mockReturnValue({
      spots: [],
      isLoading: true,
      activeCount: 0,
      fallowCount: 0,
      countByType: {},
    });
    render(<PlantingSpotsSummarySection dict={homeDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.queryByText(homeDict.sections.plantingSpotsSummary.title)).not.toBeInTheDocument();
  });
});
