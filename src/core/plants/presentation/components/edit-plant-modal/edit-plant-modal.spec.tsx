import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EditPlantModal } from './edit-plant-modal';

const dict = {
  title: 'Edit plant',
  name: 'Name',
  namePlaceholder: 'e.g. Monstera',
  nameRequired: 'Name is required',
  nameMax: 'Name is too long',
  imageUrl: 'Image URL',
  imageUrlPlaceholder: 'https://...',
  cancel: 'Cancel',
  submit: 'Save',
  submitting: 'Saving…',
  error: 'Something went wrong',
};

const plant = { id: 'plant-1', name: 'Monstera', imageUrl: 'https://example.com/img.png' };

const mockOnSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

vi.mock('@/core/plants/presentation/hooks/use-edit-plant-form/use-edit-plant-form.hook', () => ({
  useEditPlantForm: () => ({
    form: {
      register: vi.fn(() => ({})),
      formState: { errors: {} },
    },
    onSubmit: mockOnSubmit,
    isPending: false,
    error: null,
  }),
}));

describe('EditPlantModal', () => {
  it('renders with an opaque dialog surface', () => {
    render(<EditPlantModal plant={plant} dict={dict} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('card');
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<EditPlantModal plant={plant} dict={dict} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
