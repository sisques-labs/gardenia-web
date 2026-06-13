import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';

vi.mock('@/core/harvests/presentation/hooks/use-create-harvest/use-create-harvest.hook', () => ({
  useCreateHarvest: vi.fn(),
}));

vi.mock('@/core/harvests/presentation/hooks/use-update-harvest/use-update-harvest.hook', () => ({
  useUpdateHarvest: vi.fn(),
}));

import { useCreateHarvest } from '@/core/harvests/presentation/hooks/use-create-harvest/use-create-harvest.hook';
import { useUpdateHarvest } from '@/core/harvests/presentation/hooks/use-update-harvest/use-update-harvest.hook';
import { HarvestModal } from './harvest-modal';

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

const mockHarvest: Harvest = {
  id: 'h1',
  cropType: 'Tomato',
  quantity: 2.5,
  unit: 'KG',
  harvestedAt: '2026-06-01',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2026-06-01',
  updatedAt: '2026-06-01',
};

const mockCreateMutate = vi.fn();
const mockUpdateMutate = vi.fn();

describe('HarvestModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateHarvest).mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateHarvest>);
    vi.mocked(useUpdateHarvest).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateHarvest>);
  });

  it('renders create form fields', () => {
    render(<HarvestModal dict={dict} onClose={vi.fn()} />);

    expect(document.querySelector('input[name="cropType"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="quantity"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="harvestedAt"]')).toBeInTheDocument();
    expect(screen.getByText(dict.form.cropType)).toBeInTheDocument();
    expect(screen.getByText(dict.form.quantity)).toBeInTheDocument();
    expect(screen.getByText(dict.form.unit)).toBeInTheDocument();
    expect(screen.getByText(dict.form.harvestedAt)).toBeInTheDocument();
  });

  it('renders create title when no harvest prop provided', () => {
    render(<HarvestModal dict={dict} onClose={vi.fn()} />);

    expect(screen.getByText('New harvest')).toBeInTheDocument();
  });

  it('renders edit title when harvest prop provided', () => {
    render(<HarvestModal dict={dict} onClose={vi.fn()} harvest={mockHarvest} />);

    expect(screen.getByText('Edit harvest')).toBeInTheDocument();
  });

  it('submits with correct values via useCreateHarvest', async () => {
    mockCreateMutate.mockImplementation((_values: unknown, options: { onSuccess: () => void }) => {
      options.onSuccess();
    });

    const onClose = vi.fn();
    render(<HarvestModal dict={dict} onClose={onClose} />);

    fireEvent.change(document.querySelector('input[name="cropType"]')!, { target: { value: 'Lettuce' } });
    fireEvent.change(document.querySelector('input[name="quantity"]')!, { target: { value: '3' } });
    fireEvent.change(document.querySelector('input[name="harvestedAt"]')!, { target: { value: '2026-06-10' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ cropType: 'Lettuce', quantity: 3, harvestedAt: '2026-06-10' }),
        expect.any(Object),
      );
    });
  });

  it('submits with id via useUpdateHarvest when editing', async () => {
    mockUpdateMutate.mockImplementation((_values: unknown, options: { onSuccess: () => void }) => {
      options.onSuccess();
    });

    const onClose = vi.fn();
    render(<HarvestModal dict={dict} onClose={onClose} harvest={mockHarvest} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'h1' }),
        expect.any(Object),
      );
    });
  });
});
