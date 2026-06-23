import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

vi.mock('@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook', () => ({
  usePlantingSpots: vi.fn(),
}));

vi.mock('@/core/planting-spots/presentation/components/planting-spot-card/planting-spot-card', () => ({
  PlantingSpotCard: ({ spot }: { spot: PlantingSpot }) => (
    <div data-testid="spot-card">{spot.name}</div>
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

import { usePlantingSpots } from '@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook';
import { PlantingSpotsListScreen } from './planting-spots-list.screen';

const mockSpots: PlantingSpot[] = [
  {
    id: 'spot-1',
    name: 'Main Bed',
    type: 'RAISED_BED',
    description: null,
    userId: 'u1',
    spaceId: 's1',
    resolvedPlants: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'spot-2',
    name: 'Herb Pot',
    type: 'POT',
    description: 'Basil and mint',
    userId: 'u1',
    spaceId: 's1',
    resolvedPlants: [],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

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
    deleteConfirm: 'Are you sure?',
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

describe('PlantingSpotsListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page title from dict', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    expect(screen.getByText('Planting spots')).toBeInTheDocument();
  });

  it('renders skeleton grid when loading', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], totalPages: 1, currentPage: 1, isLoading: true, error: null });

    const { container } = render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state message when no spots', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    expect(screen.getByText('No planting spots in this space yet.')).toBeInTheDocument();
  });

  it('renders one PlantingSpotCard per spot', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: mockSpots, totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    expect(screen.getAllByTestId('spot-card')).toHaveLength(2);
    expect(screen.getByText('Main Bed')).toBeInTheDocument();
    expect(screen.getByText('Herb Pot')).toBeInTheDocument();
  });

  it('renders new planting spot button with correct href', () => {
    vi.mocked(usePlantingSpots).mockReturnValue({ spots: [], totalPages: 1, currentPage: 1, isLoading: false, error: null });

    render(<PlantingSpotsListScreen dict={dict} lang="en" />);

    const link = screen.getByRole('link', { name: 'New planting spot' });
    expect(link).toHaveAttribute('href', '/en/planting-spots/new');
  });
});
