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
  speciesSearch: {
    label: 'Species',
    placeholder: 'Search species…',
    noResults: 'No matches found',
    unavailable: 'Species search is unavailable right now',
  },
};

const plant = {
  id: 'plant-1',
  name: 'Monstera',
  imageUrl: 'https://example.com/img.png',
  species: { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
};

const mockMutate = vi.fn();

vi.mock('@/core/plants/presentation/hooks/use-update-plant/use-update-plant.hook', () => ({
  useUpdatePlant: () => ({ mutate: mockMutate, isPending: false, error: null }),
}));

vi.mock('@/core/plants/presentation/hooks/use-species-search/use-species-search.hook', () => ({
  useSpeciesSearch: () => ({ data: [], isFetching: false, isError: false }),
}));

describe('EditPlantModal', () => {
  it('renders with an opaque dialog surface', () => {
    render(<EditPlantModal plant={plant} dict={dict} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('card');
  });

  it('every visible field label is associated with its control', () => {
    render(<EditPlantModal plant={plant} dict={dict} onClose={vi.fn()} />);
    expect(screen.getByLabelText(dict.name)).toBeInTheDocument();
    expect(screen.getByLabelText(dict.speciesSearch.label)).toBeInTheDocument();
    expect(screen.getByLabelText(dict.imageUrl)).toBeInTheDocument();
  });

  it('pre-fills the species field with the plant current species', () => {
    render(<EditPlantModal plant={plant} dict={dict} onClose={vi.fn()} />);
    expect(screen.getByLabelText(dict.speciesSearch.label)).toHaveValue('Monstera deliciosa');
  });

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<EditPlantModal plant={plant} dict={dict} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('resubmitting unchanged keeps the species link', async () => {
    const user = userEvent.setup();
    render(<EditPlantModal plant={plant} dict={dict} onClose={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ gbifSpeciesKey: 2882337, speciesScientificName: 'Monstera deliciosa' }),
      expect.anything(),
    );
  });
});
