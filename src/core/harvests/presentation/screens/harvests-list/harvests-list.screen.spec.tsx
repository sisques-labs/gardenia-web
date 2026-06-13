import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';

vi.mock('@/core/harvests/presentation/hooks/use-harvests/use-harvests.hook', () => ({
  useHarvests: vi.fn(),
}));

vi.mock('@/core/harvests/presentation/hooks/use-delete-harvest/use-delete-harvest.hook', () => ({
  useDeleteHarvest: vi.fn(),
}));

vi.mock('@/core/harvests/presentation/components/harvest-modal/harvest-modal', () => ({
  HarvestModal: ({ harvest }: { harvest?: { cropType: string } }) => (
    <div data-testid={harvest ? 'edit-harvest-modal' : 'create-harvest-modal'} />
  ),
}));

import { useHarvests } from '@/core/harvests/presentation/hooks/use-harvests/use-harvests.hook';
import { useDeleteHarvest } from '@/core/harvests/presentation/hooks/use-delete-harvest/use-delete-harvest.hook';
import { HarvestsListScreen } from './harvests-list.screen';

const mockHarvests: Harvest[] = [
  {
    id: 'h1',
    cropType: 'Tomato',
    quantity: 2.5,
    unit: 'KG',
    harvestedAt: '2026-06-01',
    userId: 'u1',
    spaceId: 's1',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
  },
  {
    id: 'h2',
    cropType: 'Basil',
    quantity: 100,
    unit: 'G',
    harvestedAt: '2026-06-02',
    userId: 'u1',
    spaceId: 's1',
    createdAt: '2026-06-02',
    updatedAt: '2026-06-02',
  },
];

const dict = {
  list: {
    title: 'Harvests',
    empty: 'No harvests yet',
    deleteConfirm: 'Are you sure?',
    newHarvest: 'New harvest',
  },
  form: {
    title: 'New harvest',
    editTitle: 'Edit harvest',
    submitting: 'Saving...',
    cropType: 'Crop type',
    quantity: 'Quantity',
    unit: 'Unit',
    harvestedAt: 'Harvested on',
    submit: 'Save',
    cancel: 'Cancel',
  },
  row: {
    edit: 'Edit',
    delete: 'Delete',
  },
  units: {
    KG: 'kg',
    G: 'g',
    PIECES: 'pieces',
    LITERS: 'l',
    ML: 'ml',
    BUNCHES: 'bunches',
  },
  errors: {
    loadFailed: 'Could not load harvests.',
    createFailed: 'Could not create.',
    updateFailed: 'Could not update.',
    deleteFailed: 'Could not delete.',
  },
};

const mockMutate = vi.fn();

describe('HarvestsListScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteHarvest).mockReturnValue({ mutate: mockMutate } as unknown as ReturnType<typeof useDeleteHarvest>);
  });

  it('renders loading indicator when loading', () => {
    vi.mocked(useHarvests).mockReturnValue({ harvests: [], isLoading: true, error: null });

    const { container } = render(<HarvestsListScreen dict={dict} lang="en" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders empty state message when no harvests', () => {
    vi.mocked(useHarvests).mockReturnValue({ harvests: [], isLoading: false, error: null });

    render(<HarvestsListScreen dict={dict} lang="en" />);

    expect(screen.getByText('No harvests yet')).toBeInTheDocument();
  });

  it('renders a HarvestRow per harvest when list is populated', () => {
    vi.mocked(useHarvests).mockReturnValue({ harvests: mockHarvests, isLoading: false, error: null });

    render(<HarvestsListScreen dict={dict} lang="en" />);

    expect(screen.getByText('Tomato')).toBeInTheDocument();
    expect(screen.getByText('Basil')).toBeInTheDocument();
  });

  it('renders new harvest button', () => {
    vi.mocked(useHarvests).mockReturnValue({ harvests: [], isLoading: false, error: null });

    render(<HarvestsListScreen dict={dict} lang="en" />);

    expect(screen.getByRole('button', { name: 'New harvest' })).toBeInTheDocument();
  });

  it('calls useDeleteHarvest.mutate(id) when delete is triggered on a row', () => {
    vi.mocked(useHarvests).mockReturnValue({ harvests: mockHarvests, isLoading: false, error: null });

    render(<HarvestsListScreen dict={dict} lang="en" />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    expect(mockMutate).toHaveBeenCalledWith('h1');
  });

  it('opens edit modal when edit is triggered on a row', () => {
    vi.mocked(useHarvests).mockReturnValue({ harvests: mockHarvests, isLoading: false, error: null });

    render(<HarvestsListScreen dict={dict} lang="en" />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    expect(screen.getByTestId('edit-harvest-modal')).toBeInTheDocument();
  });
});
