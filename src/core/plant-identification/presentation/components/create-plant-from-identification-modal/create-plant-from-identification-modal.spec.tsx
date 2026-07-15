import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePlantFromIdentificationModal } from './create-plant-from-identification-modal';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

const dict = {
  title: 'Create plant',
  nameLabel: 'Name',
  namePlaceholder: 'e.g. My Monstera',
  nameRequired: 'Name is required',
  nameMax: 'At most 100 characters',
  submit: 'Create plant',
  submitting: 'Creating…',
  cancel: 'Cancel',
  error: 'Could not create the plant. Try again.',
};

const identification: PlantIdentification = {
  id: 'ident-1',
  status: 'resolved',
  resolved: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
  candidates: [],
  photos: [{ url: '/api/files/file-1/content', organ: 'leaf' }],
  convertedToPlantId: null,
  createdAt: '2026-07-01T10:00:00Z',
};

const mockMutate = vi.fn();

vi.mock(
  '@/core/plant-identification/presentation/hooks/use-create-plant-from-identification/use-create-plant-from-identification.hook',
  () => ({
    useCreatePlantFromIdentification: () => ({ mutate: mockMutate, isPending: false, error: null }),
  }),
);

describe('CreatePlantFromIdentificationModal', () => {
  beforeEach(() => {
    mockMutate.mockReset();
  });

  it('renders with an opaque dialog surface', () => {
    render(
      <CreatePlantFromIdentificationModal
        identification={identification}
        dict={dict}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders only a name field, labeled', () => {
    render(
      <CreatePlantFromIdentificationModal
        identification={identification}
        dict={dict}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(dict.nameLabel)).toBeInTheDocument();
  });

  it('renders a non-editable preview of the identification first photo', () => {
    render(
      <CreatePlantFromIdentificationModal
        identification={identification}
        dict={dict}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByTestId('create-plant-from-identification-preview')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <CreatePlantFromIdentificationModal
        identification={identification}
        dict={dict}
        onClose={onClose}
        onSuccess={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: dict.cancel }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls the dedicated createPlantFromIdentification mutation with the identification id and typed name', async () => {
    const user = userEvent.setup();
    render(
      <CreatePlantFromIdentificationModal
        identification={identification}
        dict={dict}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(dict.nameLabel), 'My Monstera');
    await user.click(screen.getByRole('button', { name: dict.submit }));

    expect(mockMutate).toHaveBeenCalledWith(
      { identificationId: 'ident-1', name: 'My Monstera' },
      expect.anything(),
    );
  });

  it('shows a validation error when the name is empty and does not submit', async () => {
    const user = userEvent.setup();
    render(
      <CreatePlantFromIdentificationModal
        identification={identification}
        dict={dict}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: dict.submit }));

    expect(await screen.findByText(dict.nameRequired)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls onSuccess with the created plant id when the mutation succeeds', async () => {
    mockMutate.mockImplementation((_input, opts) => {
      opts?.onSuccess?.({ id: 'plant-99' });
    });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <CreatePlantFromIdentificationModal
        identification={identification}
        dict={dict}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    );

    await user.type(screen.getByLabelText(dict.nameLabel), 'My Monstera');
    await user.click(screen.getByRole('button', { name: dict.submit }));

    expect(onSuccess).toHaveBeenCalledWith('plant-99');
  });
});
