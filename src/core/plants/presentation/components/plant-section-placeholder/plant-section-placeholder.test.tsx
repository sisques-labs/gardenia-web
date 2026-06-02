import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlantSectionPlaceholder } from './plant-section-placeholder';

describe('PlantSectionPlaceholder', () => {
  it('renders the section title', () => {
    render(<PlantSectionPlaceholder title="Care" inProgress="Coming soon" />);
    expect(screen.getByText('Care')).toBeInTheDocument();
  });

  it('renders the inProgress text', () => {
    render(<PlantSectionPlaceholder title="Watering" inProgress="En desarrollo" />);
    expect(screen.getByText('En desarrollo')).toBeInTheDocument();
  });

  it('renders with different titles', () => {
    render(<PlantSectionPlaceholder title="Growth cycle" inProgress="Coming soon" />);
    expect(screen.getByText('Growth cycle')).toBeInTheDocument();
  });
});
