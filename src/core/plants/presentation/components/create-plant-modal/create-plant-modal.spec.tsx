import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CreatePlantModal } from './create-plant-modal';

const dict = {
  title: 'New plant',
  name: 'Name',
  namePlaceholder: 'e.g. Monstera',
  nameRequired: 'Name is required',
  nameMax: 'Name is too long',
  imageUrl: 'Image URL',
  imageUrlPlaceholder: 'https://...',
  cancel: 'Cancel',
  submit: 'Create',
  submitting: 'Creating…',
  error: 'Something went wrong',
};

const mockOnSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

vi.mock('@/core/plants/presentation/hooks/use-create-plant-form/use-create-plant-form.hook', () => ({
  useCreatePlantForm: () => ({
    form: {
      register: vi.fn(() => ({})),
      formState: { errors: {} },
    },
    onSubmit: mockOnSubmit,
    isPending: false,
    error: null,
  }),
}));

describe('CreatePlantModal', () => {
  it('renders with an opaque dialog surface', () => {
    render(<CreatePlantModal spaceId="space-1" dict={dict} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('card');
  });

  it('every visible field label is associated with its control', () => {
    render(<CreatePlantModal spaceId="space-1" dict={dict} onClose={vi.fn()} />);
    expect(screen.getByLabelText(dict.name)).toBeInTheDocument();
    expect(screen.getByLabelText(dict.imageUrl)).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CreatePlantModal spaceId="space-1" dict={dict} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
