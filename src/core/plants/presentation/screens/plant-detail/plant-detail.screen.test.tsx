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
      label: 'Label · QR',
      hint: 'Print and stick on the pot',
      download: 'Download PDF',
    },
    tabs: { care: 'Care', calendar: 'Calendar', associations: 'Associations' },
    sections: {
      care: { title: 'Care', inProgress: 'Coming soon' },
      cycle: { title: 'Growth cycle', inProgress: 'Coming soon' },
      photoHistory: { title: 'Photo history', inProgress: 'Coming soon' },
      pests: { title: 'Pest tracking', inProgress: 'Coming soon' },
    },
  },
};

describe('PlantDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders plant name when data exists', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    const matches = screen.getAllByText('Monstera');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders species name when present', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByText('Monstera deliciosa')).toBeInTheDocument();
  });

  it('renders noSpecies fallback when species is absent', () => {
    const plantWithoutSpecies: Plant = { ...mockPlant, species: undefined };
    vi.mocked(usePlant).mockReturnValue({ data: plantWithoutSpecies, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByText('Unknown species')).toBeInTheDocument();
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

  it('renders QR section with image and labels when plant has qr data', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    const qrImg = screen.getByAltText('QR');
    expect(qrImg).toBeInTheDocument();
    expect(qrImg).toHaveAttribute('src', 'data:image/png;base64,base64data');
    expect(screen.getByText('Label · QR')).toBeInTheDocument();
    expect(screen.getByText('Print and stick on the pot')).toBeInTheDocument();
  });

  it('renders disabled action buttons', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByRole('button', { name: /mark watered/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /add photo/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /new note/i })).toBeDisabled();
  });

  it('renders noImage placeholder when imageUrl is absent', () => {
    const plantWithoutImage: Plant = { ...mockPlant, imageUrl: undefined };
    vi.mocked(usePlant).mockReturnValue({ data: plantWithoutImage, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.getByText('No image')).toBeInTheDocument();
  });

  it('renders breadcrumb with list link', () => {
    vi.mocked(usePlant).mockReturnValue({ data: mockPlant, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    const breadcrumbLink = screen.getByRole('link', { name: 'Inventory' });
    expect(breadcrumbLink).toBeInTheDocument();
    expect(breadcrumbLink).toHaveAttribute('href', '/en/plants');
  });
});
