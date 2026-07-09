import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

const mockOnSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

function buildFormReturn(overrides: Record<string, unknown> = {}) {
  return {
    form: {
      register: vi.fn(() => ({})),
      control: {},
      watch: vi.fn(() => undefined),
      setValue: vi.fn(),
      formState: { errors: {} },
    },
    onSubmit: mockOnSubmit,
    isPending: false,
    error: null,
    ...overrides,
  };
}

const mockUseEditPlantingSpotForm = vi.hoisted(() => vi.fn());

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-edit-planting-spot-form/use-edit-planting-spot-form.hook',
  () => ({ useEditPlantingSpotForm: mockUseEditPlantingSpotForm }),
);

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    Controller: ({ name, render }: { name: string; render: (p: { field: { value: string; onChange: () => void; onBlur: () => void; ref: () => void; name: string } }) => React.ReactNode }) =>
      render({ field: { value: 'RAISED_BED', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn(), name } }),
  };
});

vi.mock('@/shared/presentation/components/ui/select/select', () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: ReactNode }) => (
    <select data-testid="type-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => <option value={value}>{children}</option>,
}));

import { EditPlantingSpotModal } from './edit-planting-spot-modal';

const dict = {
  form: {
    titleCreate: 'New planting spot',
    titleEdit: 'Edit planting spot',
    name: 'Name',
    type: 'Type',
    description: 'Description (optional)',
    capacity: 'Capacity (optional)',
    capacityHint: 'Leave empty to set no plant limit',
    row: 'Row (optional)',
    column: 'Column (optional)',
    dimensionsWidth: 'Width (optional)',
    dimensionsHeight: 'Height (optional)',
    dimensionsLength: 'Length (optional)',
    soilType: 'Soil type (optional)',
    soilTypePlaceholder: 'e.g. Loamy, Sandy…',
    save: 'Save',
    saving: 'Saving…',
    delete: 'Delete',
    deleteConfirm: 'Are you sure?',
    cancel: 'Cancel',
    error: 'Could not save the planting spot. Try again.',
  },
  types: {
    RAISED_BED: 'Raised bed',
    POT: 'Pot',
    CONTAINER: 'Container',
    FIELD_SECTION: 'Field section',
    OTHER: 'Other',
  },
} as never;

const mockSpot: PlantingSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED',
  description: 'A nice bed',
  capacity: 5,
  row: 1,
  column: 2,
  dimensionsWidth: null,
  dimensionsHeight: null,
  dimensionsLength: null,
  soilType: null,
  userId: 'u1',
  spaceId: 's1',
  status: 'ACTIVE',
  fallowSince: null,
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('EditPlantingSpotModal', () => {
  beforeEach(() => {
    mockUseEditPlantingSpotForm.mockReturnValue(buildFormReturn());
  });

  it('renders with an opaque dialog surface and the edit title', () => {
    render(<EditPlantingSpotModal spot={mockSpot} dict={dict} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit planting spot')).toBeInTheDocument();
  });

  it('renders the shared form fields', () => {
    render(<EditPlantingSpotModal spot={mockSpot} dict={dict} onClose={vi.fn()} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Soil type (optional)')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<EditPlantingSpotModal spot={mockSpot} dict={dict} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows an error message when the mutation fails', () => {
    mockUseEditPlantingSpotForm.mockReturnValue(buildFormReturn({ error: new Error('boom') }));
    render(<EditPlantingSpotModal spot={mockSpot} dict={dict} onClose={vi.fn()} />);
    expect(screen.getByText('Could not save the planting spot. Try again.')).toBeInTheDocument();
  });
});
