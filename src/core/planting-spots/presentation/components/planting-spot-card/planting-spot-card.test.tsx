import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { PlantingSpotType } from '@/core/planting-spots/domain/types/planting-spot-type.type';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock(
  '@/core/planting-spots/presentation/components/planting-spot-type-badge/planting-spot-type-badge',
  () => ({
    PlantingSpotTypeBadge: ({ type }: { type: PlantingSpotType }) => (
      <span data-testid="type-badge">{type}</span>
    ),
  }),
);

import { PlantingSpotCard } from './planting-spot-card';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: 'A nice raised bed',
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const dict = {
  list: {
    title: 'Planting spots',
    empty: 'No planting spots in this space yet.',
    new: 'New planting spot',
    available: 'Available',
    full: 'Full',
    overCapacity: 'Over capacity',
    plants: 'plants',
    noCapacity: 'No limit',
  },
  form: {
    titleCreate: 'New planting spot',
    titleEdit: 'Edit planting spot',
    name: 'Name',
    type: 'Type',
    description: 'Description (optional)',
    capacity: 'Capacity (optional)',
    capacityHint: 'Leave empty to set no plant limit',
    row: 'Row (optional)',
    column: 'Column (optional)',
    dimensionsWidth: 'Width (optional)',
    dimensionsHeight: 'Height (optional)',
    dimensionsLength: 'Length (optional)',
    soilType: 'Soil type (optional)',
    save: 'Save',
    saving: 'Saving…',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this planting spot?',
    cancel: 'Cancel',
  },
  detail: {
    tabActivePlants: 'Active plants',
    tabRotationHistory: 'Rotation history',
    tabInfo: 'Spot info',
    editSpot: 'Edit spot',
    addPlant: 'Add plant',
    noActivePlants: 'No plants currently assigned to this spot.',
    rotationHistoryEmpty: 'No rotation history yet.',
    infoCapacity: 'Capacity',
    infoRow: 'Row',
    infoColumn: 'Column',
    infoDimensionsWidth: 'Width',
    infoDimensionsHeight: 'Height',
    infoDimensionsLength: 'Length',
    infoSoilType: 'Soil type',
    infoType: 'Type',
    infoDescription: 'Description',
    noLimit: 'No limit',
    notSet: 'Not set',
    plantsCount: 'plants',
    position: 'Position',
  },
  types: {
    RAISED_BED: 'Raised bed',
    POT: 'Pot',
    CONTAINER: 'Container',
    FIELD_SECTION: 'Field section',
    OTHER: 'Other',
  },
};

describe('PlantingSpotCard', () => {
  it('renders the spot name', () => {
    render(<PlantingSpotCard spot={mockSpot} dict={dict} lang="en" />);
    expect(screen.getByText('Main Bed')).toBeInTheDocument();
  });

  it('renders PlantingSpotTypeBadge', () => {
    render(<PlantingSpotCard spot={mockSpot} dict={dict} lang="en" />);
    expect(screen.getByTestId('type-badge')).toBeInTheDocument();
  });

  it('renders description when present', () => {
    render(<PlantingSpotCard spot={mockSpot} dict={dict} lang="en" />);
    expect(screen.getByText('A nice raised bed')).toBeInTheDocument();
  });

  it('does not render description paragraph when description is null', () => {
    const spotWithoutDesc = { ...mockSpot, description: null };
    render(<PlantingSpotCard spot={spotWithoutDesc} dict={dict} lang="en" />);
    expect(screen.queryByText('A nice raised bed')).not.toBeInTheDocument();
  });

  it('renders a link to the edit page', () => {
    render(<PlantingSpotCard spot={mockSpot} dict={dict} lang="en" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/en/planting-spots/spot-1/edit');
  });
});
