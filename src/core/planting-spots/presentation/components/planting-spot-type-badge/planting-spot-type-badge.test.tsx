import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlantingSpotTypeBadge } from './planting-spot-type-badge';
import type { PlantingSpotType } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const typeLabels: Record<PlantingSpotType, string> = {
  RAISED_BED: 'Raised bed',
  POT: 'Pot',
  CONTAINER: 'Container',
  FIELD_SECTION: 'Field section',
  OTHER: 'Other',
};

describe('PlantingSpotTypeBadge', () => {
  it('renders localized label for RAISED_BED', () => {
    render(<PlantingSpotTypeBadge type="RAISED_BED" dict={typeLabels} />);
    expect(screen.getByText('Raised bed')).toBeInTheDocument();
  });

  it('renders localized label for POT', () => {
    render(<PlantingSpotTypeBadge type="POT" dict={typeLabels} />);
    expect(screen.getByText('Pot')).toBeInTheDocument();
  });

  it('renders localized label for CONTAINER', () => {
    render(<PlantingSpotTypeBadge type="CONTAINER" dict={typeLabels} />);
    expect(screen.getByText('Container')).toBeInTheDocument();
  });

  it('renders localized label for FIELD_SECTION', () => {
    render(<PlantingSpotTypeBadge type="FIELD_SECTION" dict={typeLabels} />);
    expect(screen.getByText('Field section')).toBeInTheDocument();
  });

  it('renders localized label for OTHER', () => {
    render(<PlantingSpotTypeBadge type="OTHER" dict={typeLabels} />);
    expect(screen.getByText('Other')).toBeInTheDocument();
  });
});
