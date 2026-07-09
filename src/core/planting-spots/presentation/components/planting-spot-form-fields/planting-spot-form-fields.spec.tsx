import type { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import type { PlantingSpotFormValues } from '@/core/planting-spots/presentation/schemas/planting-spot.schema';

// Real Radix Select relies on pointer/focus-trap behaviour that jsdom doesn't
// fully emulate. Stand in with a native <select>, matching the convention
// used across this codebase's other form specs.
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

import { PlantingSpotFormFields } from './planting-spot-form-fields';

const formDict = {
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
};

const typesDict = {
  RAISED_BED: 'Raised bed',
  POT: 'Pot',
  CONTAINER: 'Container',
  FIELD_SECTION: 'Field section',
  OTHER: 'Other',
};

function Harness({ defaultValues }: { defaultValues?: Partial<PlantingSpotFormValues> }) {
  const { register, control, setValue, watch, formState: { errors } } = useForm<PlantingSpotFormValues>({
    defaultValues: {
      name: '',
      type: 'RAISED_BED',
      description: '',
      capacity: null,
      row: null,
      column: null,
      dimensionsWidth: null,
      dimensionsHeight: null,
      dimensionsLength: null,
      soilType: '',
      ...defaultValues,
    },
  });

  return (
    <PlantingSpotFormFields
      register={register}
      control={control}
      errors={errors}
      watch={watch}
      setValue={setValue}
      formDict={formDict}
      typesDict={typesDict}
    />
  );
}

describe('PlantingSpotFormFields', () => {
  it('renders every field label', () => {
    render(<Harness />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Description (optional)')).toBeInTheDocument();
    expect(screen.getByText('Capacity (optional)')).toBeInTheDocument();
    expect(screen.getByText('Row (optional)')).toBeInTheDocument();
    expect(screen.getByText('Column (optional)')).toBeInTheDocument();
    expect(screen.getByText('Width (optional)')).toBeInTheDocument();
    expect(screen.getByText('Height (optional)')).toBeInTheDocument();
    expect(screen.getByText('Length (optional)')).toBeInTheDocument();
    expect(screen.getByText('Soil type (optional)')).toBeInTheDocument();
  });

  it('renders every planting spot type as a select option', () => {
    render(<Harness />);
    expect(screen.getByRole('option', { name: 'Raised bed' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Pot' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Container' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Field section' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument();
  });

  it('does not show the clear-capacity button when capacity is unset', () => {
    render(<Harness />);
    expect(screen.queryByText('Leave empty')).not.toBeInTheDocument();
  });

  it('shows the clear-capacity button once capacity is set, and clears it on click', async () => {
    const user = userEvent.setup();
    render(<Harness defaultValues={{ capacity: 3 }} />);

    expect(screen.getByText('Leave empty')).toBeInTheDocument();
    await user.click(screen.getByText('Leave empty'));

    expect(screen.queryByText('Leave empty')).not.toBeInTheDocument();
  });

  it('increments capacity when the + button is clicked', async () => {
    const user = userEvent.setup();
    render(<Harness defaultValues={{ capacity: 2 }} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]); // + button (after − button)

    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(3);
  });

  it('decrements capacity but never below 1', async () => {
    const user = userEvent.setup();
    render(<Harness defaultValues={{ capacity: 1 }} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // − button, disabled at 1

    expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(1);
  });

  it('renders the soil type placeholder', () => {
    render(<Harness />);
    expect(screen.getByPlaceholderText('e.g. Loamy, Sandy…')).toBeInTheDocument();
  });

  it('updates a number field via direct input change', () => {
    render(<Harness />);
    // Spinbutton order: capacity, row, column, width, height, length.
    const rowInput = screen.getAllByRole('spinbutton')[1];
    fireEvent.change(rowInput, { target: { value: '4' } });
    expect(rowInput).toHaveValue(4);
  });
});
