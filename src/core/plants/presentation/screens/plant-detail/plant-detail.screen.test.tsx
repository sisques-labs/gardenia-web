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
    tabs: { care: 'Care', calendar: 'Calendar', associations: 'Associations' },
    sections: {
      care: { title: 'Care', inProgress: 'Coming soon' },
      cycle: { title: 'Growth cycle', inProgress: 'Coming soon' },
      photoHistory: { title: 'Photo history', inProgress: 'Coming soon' },
      pests: { title: 'Pest tracking', inProgress: 'Coming soon' },
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

    expect(screen.getByTestId('qr-card')).toBeInTheDocument();
    expect(screen.getByTestId('qr-image')).toHaveAttribute('src', 'data:image/png;base64,base64data');
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
  });

  it('does NOT render QR card when plant.qr is absent', () => {
    const plantWithoutQr: Plant = { ...mockPlant, qr: undefined };
    vi.mocked(usePlant).mockReturnValue({ data: plantWithoutQr, isLoading: false, isError: false } as ReturnType<typeof usePlant>);

    render(<PlantDetailScreen dict={dict} lang="en" spaceId="s1" plantId="p1" />);

    expect(screen.queryByTestId('qr-card')).not.toBeInTheDocument();
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
});
