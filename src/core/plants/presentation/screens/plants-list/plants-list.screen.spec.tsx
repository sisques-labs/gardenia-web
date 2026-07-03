import { act, render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

vi.mock('@/core/plants/presentation/hooks/use-paginated-plants/use-paginated-plants.hook', () => ({
  usePaginatedPlants: vi.fn(),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn((selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 's1' })
  ),
}));

vi.mock('@/core/plants/presentation/hooks/use-delete-plant-confirm/use-delete-plant-confirm.hook', () => ({
  useDeletePlantConfirm: vi.fn(() => ({
    plantToDelete: null,
    requestDelete: vi.fn(),
    confirmDelete: vi.fn(),
    cancelDelete: vi.fn(),
    isError: false,
  })),
}));

vi.mock('@/core/plants/presentation/components/create-plant-modal/create-plant-modal', () => ({
  CreatePlantModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="create-plant-modal">
      <button onClick={onClose}>Close modal</button>
    </div>
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

import { usePaginatedPlants } from '@/core/plants/presentation/hooks/use-paginated-plants/use-paginated-plants.hook';
import { PlantsListScreen } from './plants-list.screen';

const mockPlants: Plant[] = [
  { id: 'p1', name: 'Monstera', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
  { id: 'p2', name: 'Pothos', userId: 'u1', spaceId: 's1', createdAt: '', updatedAt: '' },
];

function paginated(items: Plant[]): PaginatedResult<Plant> {
  return { items, total: items.length, page: 1, perPage: 20, totalPages: 1 };
}

const dict = {
  nav: 'Inventory',
  list: {
    title: 'Garden Catalog',
    newPlant: 'New plant',
    empty: 'No plants yet',
    filterAll: 'All',
    filters: 'Filters',
    searchPlaceholder: 'Search plants...',
    statsPlants: 'plants',
    statsSpecies: 'species',
    inProgress: 'Coming soon',
    categories: {
      vegetable: 'Vegetable',
      herb: 'Herb',
      leafy: 'Leafy',
      root: 'Root',
      flower: 'Flower',
      tree: 'Tree',
    },
    card: {
      delete: 'Delete plant',
      health: {
        good: 'Healthy',
        warn: 'Needs attention',
        bad: 'At risk',
        inactive: 'Inactive',
      },
    },
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
    bancal: 'Plot',
    qrPrint: 'Print QR',
    noImage: 'No image',
    noSpecies: 'Unknown species',
    actions: { markWatered: 'Mark watered', addPhoto: 'Add photo', newNote: 'New note' },
    qr: { label: 'Label · QR', hint: 'Print and stick on the pot', download: 'Download PDF' },
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
  delete: {
    button: 'Delete plant',
    confirmTitle: 'Delete plant',
    confirmDescription: 'This action cannot be undone.',
    confirm: 'Delete',
    cancel: 'Cancel',
    error: 'Could not delete the plant. Try again.',
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

describe('PlantsListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a grid of PlantCards when data exists', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(screen.getByText('Monstera')).toBeInTheDocument();
    expect(screen.getByText('Pothos')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: undefined, isLoading: true, isError: false } as ReturnType<typeof usePaginatedPlants>);

    const { container } = render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state when no plants', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(screen.getByText('No plants yet')).toBeInTheDocument();
  });

  it('renders "New plant" button as enabled', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    const button = screen.getByRole('button', { name: /new plant/i });
    expect(button).not.toBeDisabled();
  });

  it('opens the create modal when "New plant" button is clicked', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(screen.queryByTestId('create-plant-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /new plant/i }));
    expect(screen.getByTestId('create-plant-modal')).toBeInTheDocument();
  });

  it('closes the create modal when onClose is called', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    fireEvent.click(screen.getByRole('button', { name: /new plant/i }));
    expect(screen.getByTestId('create-plant-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(screen.queryByTestId('create-plant-modal')).not.toBeInTheDocument();
  });

  it('renders the screen title', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(screen.getByText('Garden Catalog')).toBeInTheDocument();
  });

  it('renders "All" filter tab as active and category tabs as disabled', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    const allTab = screen.getByRole('tab', { name: /^all/i });
    expect(allTab).not.toBeDisabled();

    const disabledTabs = screen.getAllByRole('tab').filter((tab) => tab.hasAttribute('disabled'));
    expect(disabledTabs.length).toBeGreaterThan(0);
  });

  it('renders stats subtitle with plant and species counts', () => {
    const plantsWithSpecies: Plant[] = [
      { id: 'p1', name: 'Monstera', userId: 'u1', spaceId: 's1', plantSpeciesId: 'sp1', createdAt: '', updatedAt: '' },
      { id: 'p2', name: 'Pothos', userId: 'u1', spaceId: 's1', plantSpeciesId: 'sp2', createdAt: '', updatedAt: '' },
    ];
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(plantsWithSpecies), isLoading: false, isError: false, speciesCount: 2 } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    expect(screen.getByText(/inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/2 plants/i)).toBeInTheDocument();
    expect(screen.getByText(/2 species/i)).toBeInTheDocument();
  });

  it('renders disabled Filters button', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    const filtersBtn = screen.getByRole('button', { name: /filters/i });
    expect(filtersBtn).toBeDisabled();
  });

  it('renders a search input bound to the name filter', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    const searchInput = screen.getByPlaceholderText('Search plants...');
    expect(searchInput).toBeInTheDocument();
  });

  it('passes the typed search text as a NAME/LIKE filter to usePaginatedPlants after the debounce delay', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    const searchInput = screen.getByPlaceholderText('Search plants...');
    fireEvent.change(searchInput, { target: { value: 'Rose' } });
    act(() => vi.advanceTimersByTime(300));

    const lastCall = vi.mocked(usePaginatedPlants).mock.calls.at(-1);
    expect(lastCall?.[1]?.filters).toEqual([{ field: 'NAME', operator: 'LIKE', value: 'Rose' }]);
  });

  it('does not query by the typed search text before the debounce delay elapses', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);

    const searchInput = screen.getByPlaceholderText('Search plants...');
    fireEvent.change(searchInput, { target: { value: 'Rose' } });

    const lastCall = vi.mocked(usePaginatedPlants).mock.calls.at(-1);
    expect(lastCall?.[1]?.filters).toEqual([]);
  });

  it('resets to page 1 once the debounced search filter changes', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);
    expect(mockPush).not.toHaveBeenCalled();

    const searchInput = screen.getByPlaceholderText('Search plants...');
    fireEvent.change(searchInput, { target: { value: 'Rose' } });
    act(() => vi.advanceTimersByTime(300));

    expect(mockPush).toHaveBeenCalledWith('?page=1');
  });

  it('does not reset the page on initial render', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" />);
    act(() => vi.advanceTimersByTime(300));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
