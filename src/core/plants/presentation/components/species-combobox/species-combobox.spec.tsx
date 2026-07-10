import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SpeciesCombobox } from './species-combobox';

const mockUseSpeciesSearch = vi.hoisted(() => vi.fn());

vi.mock('@/core/plants/presentation/hooks/use-species-search/use-species-search.hook', () => ({
  useSpeciesSearch: (query: string) => mockUseSpeciesSearch(query),
}));

describe('SpeciesCombobox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSpeciesSearch.mockReturnValue({ data: undefined, isFetching: false, isError: false });
  });

  it('renders suggestions returned by useSpeciesSearch', async () => {
    mockUseSpeciesSearch.mockReturnValue({
      data: [
        { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
        { gbifKey: 5352251, scientificName: 'Ficus lyrata' },
      ],
      isFetching: false,
      isError: false,
    });

    render(<SpeciesCombobox />);
    await userEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('Monstera deliciosa')).toBeInTheDocument();
    expect(screen.getByText('Ficus lyrata')).toBeInTheDocument();
  });

  it('selecting a suggestion calls onChange with it', async () => {
    mockUseSpeciesSearch.mockReturnValue({
      data: [{ gbifKey: 2882337, scientificName: 'Monstera deliciosa' }],
      isFetching: false,
      isError: false,
    });
    const onChange = vi.fn();

    render(<SpeciesCombobox onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Monstera deliciosa'));

    expect(onChange).toHaveBeenCalledWith({ gbifKey: 2882337, scientificName: 'Monstera deliciosa' });
  });

  it('shows the unavailable message on error', async () => {
    mockUseSpeciesSearch.mockReturnValue({ data: undefined, isFetching: false, isError: true });

    render(<SpeciesCombobox unavailableLabel="Search is down" />);
    await userEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('Search is down')).toBeInTheDocument();
  });

  it('shows the no-results message when the search returns nothing', async () => {
    mockUseSpeciesSearch.mockReturnValue({ data: [], isFetching: false, isError: false });

    render(<SpeciesCombobox noResultsLabel="Nothing found" />);
    await userEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('Nothing found')).toBeInTheDocument();
  });

  it('clearing the typed value after a selection resets onChange to null', async () => {
    mockUseSpeciesSearch.mockReturnValue({
      data: [{ gbifKey: 2882337, scientificName: 'Monstera deliciosa' }],
      isFetching: false,
      isError: false,
    });
    const onChange = vi.fn();

    render(<SpeciesCombobox value={{ gbifKey: 2882337, scientificName: 'Monstera deliciosa' }} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'x');

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('Escape hides the option list', async () => {
    mockUseSpeciesSearch.mockReturnValue({
      data: [{ gbifKey: 2882337, scientificName: 'Monstera deliciosa' }],
      isFetching: false,
      isError: false,
    });

    render(<SpeciesCombobox />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByText('Monstera deliciosa')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('Monstera deliciosa')).not.toBeInTheDocument();
  });

  it('exposes an accessible name via ariaLabel for label association', () => {
    render(<SpeciesCombobox ariaLabel="My species field" />);
    expect(screen.getByRole('combobox', { name: 'My species field' })).toBeInTheDocument();
  });
});
