import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';

vi.mock('@/core/plants/presentation/hooks/use-plants/use-plants.hook', () => ({
  usePlants: vi.fn(),
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

import { usePlants } from '@/core/plants/presentation/hooks/use-plants/use-plants.hook';
import { PlantsListScreen } from './plants-list.screen';

const mockPlants: Plant[] = [
  { id: 'p1', name: 'Monstera', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
  { id: 'p2', name: 'Pothos', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
];

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
  detail: {
    breadcrumbList: 'Inventory',
    qrPrint: 'Print QR',
    noImage: 'No image',
    noSpecies: 'Unknown species',
    actions: { markWatered: 'Mark watered', addPhoto: 'Add photo', newNote: 'New note' },
    qr: { label: 'Label · QR', hint: 'Print and stick on the pot', download: 'Download PDF' },
    tabs: { care: 'Care', calendar: 'Calendar', associations: 'Associations' },
    sections: {
      care: { title: 'Care', inProgress: 'Coming soon' },
      cycle: { title: 'Growth cycle', inProgress: 'Coming soon' },
      photoHistory: { title: 'Photo history', inProgress: 'Coming soon' },
      pests: { title: 'Pest tracking', inProgress: 'Coming soon' },
    },
  },
};

describe('PlantsListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a grid of PlantCards when data exists', () => {
    vi.mocked(usePlants).mockReturnValue({ data: mockPlants, isLoading: false, isError: false } as ReturnType<typeof usePlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(screen.getByText('Monstera')).toBeInTheDocument();
    expect(screen.getByText('Pothos')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    vi.mocked(usePlants).mockReturnValue({ data: undefined, isLoading: true, isError: false } as ReturnType<typeof usePlants>);

    const { container } = render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state when no plants', () => {
    vi.mocked(usePlants).mockReturnValue({ data: [] as Plant[], isLoading: false, isError: false } as unknown as ReturnType<typeof usePlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(screen.getByText('No plants yet')).toBeInTheDocument();
  });

  it('renders "New plant" button as disabled', () => {
    vi.mocked(usePlants).mockReturnValue({ data: [] as Plant[], isLoading: false, isError: false } as unknown as ReturnType<typeof usePlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    const button = screen.getByRole('button', { name: /new plant/i });
    expect(button).toBeDisabled();
  });

  it('renders the screen title', () => {
    vi.mocked(usePlants).mockReturnValue({ data: [] as Plant[], isLoading: false, isError: false } as unknown as ReturnType<typeof usePlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(screen.getByText('Garden Catalog')).toBeInTheDocument();
  });

  it('renders "All" filter tab as active and category tabs as disabled', () => {
    vi.mocked(usePlants).mockReturnValue({ data: mockPlants, isLoading: false, isError: false } as ReturnType<typeof usePlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    const allTab = screen.getByRole('button', { name: /^all/i });
    expect(allTab).not.toBeDisabled();

    const disabledTabs = screen.getAllByRole('button').filter((btn) => btn.hasAttribute('disabled'));
    expect(disabledTabs.length).toBeGreaterThan(0);
  });

  it('renders stats subtitle with plant and species counts', () => {
    const plantsWithSpecies: Plant[] = [
      { id: 'p1', name: 'Monstera', userId: 'u1', spaceId: 's1', plantSpeciesId: 'sp1', createdAt: '', updatedAt: '' },
      { id: 'p2', name: 'Pothos', userId: 'u1', spaceId: 's1', plantSpeciesId: 'sp2', createdAt: '', updatedAt: '' },
    ];
    vi.mocked(usePlants).mockReturnValue({ data: plantsWithSpecies, isLoading: false, isError: false } as ReturnType<typeof usePlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(screen.getByText(/inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/2 plants/i)).toBeInTheDocument();
    expect(screen.getByText(/2 species/i)).toBeInTheDocument();
  });

  it('renders disabled Filters button', () => {
    vi.mocked(usePlants).mockReturnValue({ data: mockPlants, isLoading: false, isError: false } as ReturnType<typeof usePlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    const filtersBtn = screen.getByRole('button', { name: /filters/i });
    expect(filtersBtn).toBeDisabled();
  });
});
