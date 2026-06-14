import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockRouterPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock('@/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook', () => ({
  usePlantingSpot: vi.fn(),
}));

vi.mock('@/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook', () => ({
  useCreatePlantingSpot: vi.fn(),
}));

vi.mock('@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook', () => ({
  useUpdatePlantingSpot: vi.fn(),
}));

vi.mock('@/core/planting-spots/presentation/hooks/use-delete-planting-spot/use-delete-planting-spot.hook', () => ({
  useDeletePlantingSpot: vi.fn(),
}));

import { usePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook';
import { useCreatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook';
import { useUpdatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook';
import { useDeletePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-delete-planting-spot/use-delete-planting-spot.hook';
import { PlantingSpotFormScreen } from './planting-spot-form.screen';

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'raised_bed',
  description: 'A nice bed',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const dict = {
  list: {
    title: 'Planting spots',
    empty: 'No planting spots.',
    new: 'New planting spot',
  },
  form: {
    titleCreate: 'New planting spot',
    titleEdit: 'Edit planting spot',
    name: 'Name',
    type: 'Type',
    description: 'Description (optional)',
    save: 'Save',
    saving: 'Saving…',
    delete: 'Delete',
    deleteConfirm: 'Are you sure you want to delete this planting spot?',
    cancel: 'Cancel',
  },
  types: {
    raised_bed: 'Raised bed',
    pot: 'Pot',
    container: 'Container',
    field_section: 'Field section',
    other: 'Other',
  },
};

const mockMutate = vi.fn();
const mockDeleteMutate = vi.fn();

function setupMocks({ isLoading = false }: { isLoading?: boolean } = {}) {
  vi.mocked(usePlantingSpot).mockReturnValue({ spot: mockSpot, isLoading, error: null });
  vi.mocked(useCreatePlantingSpot).mockReturnValue({ mutate: mockMutate, isPending: false } as never);
  vi.mocked(useUpdatePlantingSpot).mockReturnValue({ mutate: mockMutate, isPending: false } as never);
  vi.mocked(useDeletePlantingSpot).mockReturnValue({ mutate: mockDeleteMutate, isPending: false } as never);
}

describe('PlantingSpotFormScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders create title in create mode', () => {
    vi.mocked(usePlantingSpot).mockReturnValue({ spot: null, isLoading: false, error: null });
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="create" />);
    expect(screen.getAllByText('New planting spot').length).toBeGreaterThan(0);
  });

  it('renders edit title in edit mode', () => {
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="edit" spotId="spot-1" />);
    expect(screen.getAllByText('Edit planting spot').length).toBeGreaterThan(0);
  });

  it('pre-fills name field in edit mode', async () => {
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="edit" spotId="spot-1" />);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Main Bed')).toBeInTheDocument();
    });
  });

  it('renders delete button only in edit mode', () => {
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="edit" spotId="spot-1" />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('does not render delete button in create mode', () => {
    vi.mocked(usePlantingSpot).mockReturnValue({ spot: null, isLoading: false, error: null });
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="create" />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    render(<PlantingSpotFormScreen dict={dict} lang="en" mode="edit" spotId="spot-1" />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => {
      expect(screen.getByText('Are you sure you want to delete this planting spot?')).toBeInTheDocument();
    });
  });

  it('renders skeleton when loading in edit mode', () => {
    setupMocks({ isLoading: true });
    const { container } = render(<PlantingSpotFormScreen dict={dict} lang="en" mode="edit" spotId="spot-1" />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
