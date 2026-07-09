import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';

vi.mock('@/core/harvests/presentation/hooks/use-harvest-form/use-harvest-form.hook', () => ({
  useHarvestForm: vi.fn(),
}));

import { useHarvestForm } from '@/core/harvests/presentation/hooks/use-harvest-form/use-harvest-form.hook';
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

function makeMockForm(overrides: Partial<ReturnType<typeof useHarvestForm>> = {}) {
  const mockRegister = vi.fn((name: string) => ({ name }));
  return {
    form: {
      register: mockRegister,
      formState: { errors: {} },
    },
    isPending: false,
    onSubmit: vi.fn((e?: React.BaseSyntheticEvent) => { e?.preventDefault?.(); }),
    selectedUnit: 'KG' as const,
    setUnit: vi.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useHarvestForm>;
}

describe('HarvestModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useHarvestForm).mockReturnValue(makeMockForm());
  });

  it('renders create form fields', () => {
    render(<HarvestModal dict={dict} onClose={vi.fn()} />);

    expect(screen.getByText(dict.form.cropType)).toBeInTheDocument();
    expect(screen.getByText(dict.form.quantity)).toBeInTheDocument();
    expect(screen.getByText(dict.form.unit)).toBeInTheDocument();
    expect(screen.getByText(dict.form.harvestedAt)).toBeInTheDocument();
  });

  it('every visible field label is associated with its control', () => {
    render(<HarvestModal dict={dict} onClose={vi.fn()} />);
    expect(screen.getByLabelText(dict.form.cropType)).toBeInTheDocument();
    expect(screen.getByLabelText(dict.form.quantity)).toBeInTheDocument();
    expect(screen.getByLabelText(dict.form.unit)).toBeInTheDocument();
    expect(screen.getByLabelText(dict.form.harvestedAt)).toBeInTheDocument();
  });

  it('renders create title when no harvest prop provided', () => {
    render(<HarvestModal dict={dict} onClose={vi.fn()} />);

    expect(screen.getByText('New harvest')).toBeInTheDocument();
  });

  it('renders edit title when harvest prop provided', () => {
    render(<HarvestModal dict={dict} onClose={vi.fn()} harvest={mockHarvest} />);

    expect(screen.getByText('Edit harvest')).toBeInTheDocument();
  });

  it('passes harvest and onClose to useHarvestForm', () => {
    const onClose = vi.fn();
    render(<HarvestModal dict={dict} onClose={onClose} harvest={mockHarvest} />);

    expect(vi.mocked(useHarvestForm)).toHaveBeenCalledWith({ harvest: mockHarvest, onClose });
  });

  it('calls onSubmit when form is submitted', async () => {
    const mockOnSubmit = vi.fn(async (e?: React.BaseSyntheticEvent) => { e?.preventDefault?.(); });
    vi.mocked(useHarvestForm).mockReturnValue(makeMockForm({ onSubmit: mockOnSubmit }));

    render(<HarvestModal dict={dict} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
