import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: mockReplace })),
}));

vi.mock('@/core/plants/presentation/hooks/use-plant/use-plant.hook', () => ({
  usePlant: vi.fn(),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn((selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 's1' })
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { usePlant } from '@/core/plants/presentation/hooks/use-plant/use-plant.hook';
import { PlantDetailScreen } from './plant-detail.screen';

const mockPlant: Plant = {
  id: 'p1',
  name: 'Monstera',
  userId: 'u1',
  spaceId: 's1',
  species: { id: 'sp1', name: 'Monstera deliciosa', createdAt: '', updatedAt: '' },
  imageUrl: 'https://example.com/plant.jpg',
  qr: {
    id: 'qr1',
    spaceId: 's1',
    targetUrl: 'https://example.com',
    generation: 1,
    image: 'base64data',
    createdAt: '',
    updatedAt: '',
  },
  createdAt: '',
  updatedAt: '',
};

const dict = {
  nav: 'Inventory',
  list: {
    title: 'Garden Catalog',
    newPlant: 'New plant',
    empty: 'No plants yet',
    filterAll: 'All',
    filters: 'Filters',
    statsPlants: 'plants',
    statsSpecies: 'species',
    inProgress: 'Coming soon',
  },
  create: {
    title: 'New plant',
    name: 'Name',
    namePlaceholder: 'e.g. Monstera',
    nameRequired: 'Name is required',
    nameMax: 'At most 100 characters',
    imageUrl: 'Image URL',
    imageUrlPlaceholder: 'https://...',
    submit: 'Create',
    submitting: 'Creating...',
    cancel: 'Cancel',
    error: 'Could not create the plant. Try again.',
  },
  detail: {
    breadcrumbList: 'Inventory',
    qrPrint: 'Print QR',
    noImage: 'No image',
    noSpecies: 'Unknown species',
    actions: {
      markWatered: 'Mark watered',
      addPhoto: 'Add photo',
      newNote: 'New note',
    },
    qr: {
      label: 'ETIQUETA · QR',
      hint: 'Imprime y pega en la maceta',
      download: 'Descargar PDF',
    },
    tabs: { care: 'Care', calendar: 'Calendar', diary: 'Diary', harvests: 'Harvests', pests: 'Pests', associations: 'Associations' },
    sections: {
      care: { title: 'Care', inProgress: 'Coming soon' },
      cycle: { title: 'Growth cycle', inProgress: 'Coming soon' },
      photoHistory: { title: 'Photo history', inProgress: 'Coming soon' },
      pests: { title: 'Pest tracking', inProgress: 'Coming soon' },
    },
    care: {
      wateringLabel: 'WATERING',
      wateringTitle: 'Every day · 250 ml',
      wateringDesc: 'Reduce to 200ml when flowering. Deep, infrequent.',
      sunLabel: 'SUN',
      sunTitle: '6–8 h direct',
      sunDesc: 'Face south. Heat tolerant but shade above 35°C.',
      soilLabel: 'SOIL',
      soilTitle: 'Rich, drained · pH 6.0–6.8',
      soilDesc: 'Add compost every 3 weeks. Stake from day 21.',
      pruningLabel: 'PRUNING',
      pruningTitle: 'Remove suckers',
      pruningDesc: 'Once a week. Lower leaves after first flowering.',
    },
    cycle: {
      title: 'CYCLE · 64 DAYS',
      seedStage: 'Seed',
      seedlingStage: 'Seedling',
      vegetativeStage: 'Vegetative',
      fruitingStage: 'Fruiting',
    },
    photoHistory: {
      title: 'PHOTO HISTORY',
    },
    pestTracking: {
      title: 'PEST TRACKING',
    },
  },
  plantDetail: {
    actions: {
      markWatered: 'Mark watered',
      addPhoto: 'Add photo',
      newNote: 'New note',
    },
    qr: {
      label: 'ETIQUETA · QR',
      hint: 'Print and stick on the pot',
      downloadPdf: 'Download PDF',
    },
  },
};

describe('PlantDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders plant name via data-testid="plant-name"', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByTestId('plant-name')).toHaveTextContent('Monstera');
  });

  it('renders species name via data-testid="plant-species"', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByTestId('plant-species')).toHaveTextContent('Monstera deliciosa');
  });

  it('renders 3 action buttons that are NOT disabled', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    const btnMarkWatered = screen.getByTestId('btn-mark-watered');
    const btnAddPhoto = screen.getByTestId('btn-add-photo');
    const btnNewNote = screen.getByTestId('btn-new-note');

    expect(btnMarkWatered).not.toBeDisabled();
    expect(btnAddPhoto).not.toBeDisabled();
    expect(btnNewNote).not.toBeDisabled();
  });

  it('renders QR card when plant.qr exists', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByTestId('plant-qr-card')).toBeInTheDocument();
    expect(screen.getByTestId('qr-image')).toHaveAttribute('src', 'data:image/png;base64,base64data');
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
  });

  it('does NOT render QR card when plant.qr is absent', () => {
    const plantWithoutQr: Plant = { ...mockPlant, qr: undefined };
    vi.mocked(usePlant).mockReturnValue({ data: plantWithoutQr, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.queryByTestId('plant-qr-card')).not.toBeInTheDocument();
  });

  it('renders placeholder image when plant.imageUrl is null', () => {
    const plantWithoutImage: Plant = { ...mockPlant, imageUrl: undefined };
    vi.mocked(usePlant).mockReturnValue({ data: plantWithoutImage, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByTestId('plant-image')).toBeInTheDocument();
    // placeholder has no <img> inside
    expect(screen.queryByRole('img', { name: 'Monstera' })).not.toBeInTheDocument();
  });

  it('renders actual image when plant.imageUrl exists', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    const img = screen.getByRole('img', { name: 'Monstera' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/plant.jpg');
  });

  it('renders species chip with sage variant', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByTestId('chip-species')).toBeInTheDocument();
  });

  it('renders skeleton when loading', () => {
    vi.mocked(usePlant).mockReturnValue({ data: undefined, isLoading: true, isError: false } as ReturnType<typeof usePlant>);

    const { container } = render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('redirects to plants list on error', () => {
    vi.mocked(usePlant).mockReturnValue({ data: undefined, isLoading: false, isError: true } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(mockReplace).toHaveBeenCalledWith('/en/plants');
  });

  it('renders breadcrumb with list link', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    const breadcrumbLink = screen.getByRole('link', { name: 'Inventory' });
    expect(breadcrumbLink).toBeInTheDocument();
    expect(breadcrumbLink).toHaveAttribute('href', '/en/plants');
  });

  it('renders action bar wrapper with data-testid="plant-action-bar"', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByTestId('plant-action-bar')).toBeInTheDocument();
  });

  it('renders care grid with data-testid="care-grid"', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByTestId('care-grid')).toBeInTheDocument();
  });

  it('renders 4 CareCard components in the Cuidados tab', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    const careCards = screen.getAllByTestId('care-card');
    expect(careCards).toHaveLength(4);
  });

  it('renders GrowthTimeline in the Cuidados tab', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByTestId('growth-timeline')).toBeInTheDocument();
  });

  it('renders cycle title heading', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByText('CYCLE · 64 DAYS')).toBeInTheDocument();
  });

  it('renders Calendar tab trigger', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByRole('tab', { name: 'Calendar' })).toBeInTheDocument();
  });

  it('renders Diary tab trigger', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByRole('tab', { name: 'Diary' })).toBeInTheDocument();
  });

  it('renders Harvests tab trigger', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByRole('tab', { name: 'Harvests' })).toBeInTheDocument();
  });

  it('renders Pests tab trigger', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByRole('tab', { name: 'Pests' })).toBeInTheDocument();
  });

  it('renders Associations tab trigger', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByRole('tab', { name: 'Associations' })).toBeInTheDocument();
  });

  it('all tab triggers are NOT disabled', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    const tabs = screen.getAllByRole('tab');
    tabs.forEach((tab) => {
      expect(tab).not.toBeDisabled();
    });
  });
});
