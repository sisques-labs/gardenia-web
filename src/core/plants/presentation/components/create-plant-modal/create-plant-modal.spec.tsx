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
  speciesSearch: {
    label: 'Species',
    placeholder: 'Search species…',
    noResults: 'No matches found',
    unavailable: 'Species search is unavailable right now',
  },
};

const mockMutate = vi.fn();

vi.mock('@/core/plants/presentation/hooks/use-create-plant/use-create-plant.hook', () => ({
  useCreatePlant: () => ({ mutate: mockMutate, isPending: false, error: null }),
}));

vi.mock('@/core/plants/presentation/hooks/use-species-search/use-species-search.hook', () => ({
  useSpeciesSearch: () => ({ data: [], isFetching: false, isError: false }),
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
    expect(screen.getByLabelText(dict.speciesSearch.label)).toBeInTheDocument();
    expect(screen.getByLabelText(dict.imageUrl)).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<CreatePlantModal spaceId="space-1" dict={dict} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('submits with the selected species mapped to gbifSpeciesKey/speciesScientificName', async () => {
    const user = userEvent.setup();
    render(<CreatePlantModal spaceId="space-1" dict={dict} onClose={vi.fn()} />);

    await user.type(screen.getByLabelText(dict.name), 'Rose');
    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Rose', gbifSpeciesKey: undefined, speciesScientificName: undefined }),
      expect.anything(),
    );
  });
});
