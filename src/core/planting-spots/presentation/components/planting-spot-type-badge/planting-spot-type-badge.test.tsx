import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlantingSpotTypeBadge } from './planting-spot-type-badge';
import type { PlantingSpotType } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const typeLabels: Record<PlantingSpotType, string> = {
  raised_bed: 'Raised bed',
  pot: 'Pot',
  container: 'Container',
  field_section: 'Field section',
  other: 'Other',
};

describe('PlantingSpotTypeBadge', () => {
  it('renders localized label for raised_bed', () => {
    render(<PlantingSpotTypeBadge type="raised_bed" dict={typeLabels} />);
    expect(screen.getByText('Raised bed')).toBeInTheDocument();
  });

  it('renders localized label for pot', () => {
    render(<PlantingSpotTypeBadge type="pot" dict={typeLabels} />);
    expect(screen.getByText('Pot')).toBeInTheDocument();
  });

  it('renders localized label for container', () => {
    render(<PlantingSpotTypeBadge type="container" dict={typeLabels} />);
    expect(screen.getByText('Container')).toBeInTheDocument();
  });

  it('renders localized label for field_section', () => {
    render(<PlantingSpotTypeBadge type="field_section" dict={typeLabels} />);
    expect(screen.getByText('Field section')).toBeInTheDocument();
  });

  it('renders localized label for other', () => {
    render(<PlantingSpotTypeBadge type="other" dict={typeLabels} />);
    expect(screen.getByText('Other')).toBeInTheDocument();
  });
});
