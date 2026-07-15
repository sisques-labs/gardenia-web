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
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
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
    searchChipLabel: 'Search',
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
    speciesSearch: {
      label: 'Species',
      placeholder: 'Search species…',
      noResults: 'No matches found',
      unavailable: 'Species search is unavailable right now',
    },
  },
  edit: {
    title: 'Edit plant',
    name: 'Name',
    namePlaceholder: 'e.g. Monstera',
    nameRequired: 'Name is required',
    nameMax: 'At most 100 characters',
    imageUrl: 'Image URL',
    imageUrlPlaceholder: 'https://...',
    submit: 'Save',
    submitting: 'Saving...',
    cancel: 'Cancel',
    error: 'Could not update the plant. Try again.',
    speciesSearch: {
      label: 'Species',
      placeholder: 'Search species…',
      noResults: 'No matches found',
      unavailable: 'Species search is unavailable right now',
    },
  },
  detail: {
    breadcrumbList: 'Inventory',
    noSpecies: 'Unknown species',
    actions: {
      markWatered: 'Mark watered',
      markWateredError: 'Could not log the watering. Try again.',
      edit: 'Edit',
    },
    care: {
      lastWatered: 'Last watered',
      neverWatered: 'Not watered yet',
    },
    addedOn: 'In your garden since',
    plantingSpot: {
      label: 'Planting spot',
      unassigned: 'Unassigned',
      placeholder: 'Select a planting spot',
      updateError: 'Could not update the planting spot. Try again.',
    },
    qr: { label: 'Label · QR', hint: 'Print and stick on the pot', download: 'Download PDF' },
    calendarTitle: 'Upcoming tasks',
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

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    expect(screen.getByText('Monstera')).toBeInTheDocument();
    expect(screen.getByText('Pothos')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: undefined, isLoading: true, isError: false } as ReturnType<typeof usePaginatedPlants>);

    const { container } = render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state when no plants', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    expect(screen.getByText('No plants yet')).toBeInTheDocument();
  });

  it('renders an "Identify plant" entry point linking to the identify route, next to "New plant"', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    const identifyLink = screen.getByTestId('btn-identify-plant');
    expect(identifyLink).toHaveTextContent('Identify plant');
    expect(identifyLink).toHaveAttribute('href', '/en/plants/identify');
    expect(screen.getByRole('button', { name: /new plant/i })).toBeInTheDocument();
  });

  it('renders "New plant" button as enabled', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    const button = screen.getByRole('button', { name: /new plant/i });
    expect(button).not.toBeDisabled();
  });

  it('opens the create modal when "New plant" button is clicked', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    expect(screen.queryByTestId('create-plant-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /new plant/i }));
    expect(screen.getByTestId('create-plant-modal')).toBeInTheDocument();
  });

  it('closes the create modal when onClose is called', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    fireEvent.click(screen.getByRole('button', { name: /new plant/i }));
    expect(screen.getByTestId('create-plant-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(screen.queryByTestId('create-plant-modal')).not.toBeInTheDocument();
  });

  it('renders the screen title', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated([]), isLoading: false, isError: false } as unknown as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    expect(screen.getByText('Garden Catalog')).toBeInTheDocument();
  });

  it('renders "All" filter tab as active and category tabs as disabled', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

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

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    expect(screen.getByText(/inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/2 plants/i)).toBeInTheDocument();
    expect(screen.getByText(/2 species/i)).toBeInTheDocument();
  });

  it('renders disabled Filters button', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    const filtersBtn = screen.getByRole('button', { name: /filters/i });
    expect(filtersBtn).toBeDisabled();
  });

  it('renders a search input bound to the name filter', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    const searchInput = screen.getByPlaceholderText('Search plants...');
    expect(searchInput).toBeInTheDocument();
  });

  it('shows a removable search chip once a search term is typed', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);
    expect(screen.queryByText(/Search:/)).not.toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search plants...');
    fireEvent.change(searchInput, { target: { value: 'Rose' } });

    expect(screen.getByText('Search: Rose')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Remove Search: Rose'));
    expect((searchInput as HTMLInputElement).value).toBe('');
  });

  it('passes the typed search text as a NAME/LIKE filter to usePaginatedPlants after the debounce delay', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    const searchInput = screen.getByPlaceholderText('Search plants...');
    fireEvent.change(searchInput, { target: { value: 'Rose' } });
    act(() => vi.advanceTimersByTime(300));

    const lastCall = vi.mocked(usePaginatedPlants).mock.calls.at(-1);
    expect(lastCall?.[1]?.filters).toEqual([{ field: 'NAME', operator: 'LIKE', value: 'Rose' }]);
  });

  it('does not query by the typed search text before the debounce delay elapses', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);

    const searchInput = screen.getByPlaceholderText('Search plants...');
    fireEvent.change(searchInput, { target: { value: 'Rose' } });

    const lastCall = vi.mocked(usePaginatedPlants).mock.calls.at(-1);
    expect(lastCall?.[1]?.filters).toEqual([]);
  });

  it('resets to page 1 once the debounced search filter changes', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);
    expect(mockPush).not.toHaveBeenCalled();

    const searchInput = screen.getByPlaceholderText('Search plants...');
    fireEvent.change(searchInput, { target: { value: 'Rose' } });
    act(() => vi.advanceTimersByTime(300));

    expect(mockPush).toHaveBeenCalledWith('?page=1');
  });

  it('does not reset the page on initial render', () => {
    vi.mocked(usePaginatedPlants).mockReturnValue({ data: paginated(mockPlants), isLoading: false, isError: false } as ReturnType<typeof usePaginatedPlants>);

    render(<PlantsListScreen dict={dict} lang="en" spaceId="s1" identifyLabel="Identify plant" />);
    act(() => vi.advanceTimersByTime(300));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
