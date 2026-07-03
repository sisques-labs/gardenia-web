import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import type { InventoryFiltersState } from '@/core/inventory/presentation/hooks/use-inventory-filters/inventory-filters-state.interface';
import { InventoryFilters } from './inventory-filters';

const dict = enInventory as AppDict['inventory'];

const filters: InventoryFiltersState = {
  query: '',
  types: [],
  lowStockOnly: false,
  expiringSoonOnly: false,
};

function setup(overrides: Partial<React.ComponentProps<typeof InventoryFilters>> = {}) {
  const props = {
    dict,
    filters,
    onQueryChange: vi.fn(),
    onToggleType: vi.fn(),
    onToggleLowStock: vi.fn(),
    onToggleExpiringSoon: vi.fn(),
    onRemoveFilter: vi.fn(),
    ...overrides,
  };
  render(<InventoryFilters {...props} />);
  return props;
}

describe('InventoryFilters', () => {
  it('renders the search input with placeholder', () => {
    setup();
    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
  });

  it('calls onQueryChange when typing in the search box', () => {
    const props = setup();
    fireEvent.change(screen.getByPlaceholderText('Search by name...'), {
      target: { value: 'tomato' },
    });
    expect(props.onQueryChange).toHaveBeenCalledWith('tomato');
  });

  it('renders the low-stock and expiring toggles', () => {
    setup();
    expect(screen.getByText('Low stock')).toBeInTheDocument();
    expect(screen.getByText('Expiring soon')).toBeInTheDocument();
  });

  it('shows "All types" when no type is selected', () => {
    setup();
    expect(screen.getByText('All types')).toBeInTheDocument();
  });

  it('shows the single type label when one type is selected', () => {
    setup({ filters: { ...filters, types: ['SEEDS'] } });
    expect(screen.getByRole('button', { name: 'Seeds' })).toBeInTheDocument();
  });

  it('shows a count when multiple types are selected', () => {
    setup({ filters: { ...filters, types: ['SEEDS', 'FERTILIZER'] } });
    expect(screen.getByText('2 types selected')).toBeInTheDocument();
  });

  it('toggles a type when checked in the dropdown', async () => {
    const user = userEvent.setup();
    const props = setup();

    await user.click(screen.getByRole('button', { name: /all types/i }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Seeds' }));

    expect(props.onToggleType).toHaveBeenCalledWith('SEEDS');
  });

  it('keeps the dropdown open after toggling a type', async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole('button', { name: /all types/i }));
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Seeds' }));

    expect(screen.getByRole('menuitemcheckbox', { name: 'Fertilizer' })).toBeInTheDocument();
  });

  it('renders no chips when no filters are active', () => {
    setup();
    expect(screen.queryByText(/Search:/)).not.toBeInTheDocument();
  });

  it('renders a chip per active filter, including one per selected type', () => {
    setup({
      filters: { query: 'lettuce', types: ['SEEDS', 'FERTILIZER'], lowStockOnly: true, expiringSoonOnly: true },
    });

    expect(screen.getByText('Search: lettuce')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Seeds')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Fertilizer')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Low stock')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Expiring soon')).toBeInTheDocument();
  });

  it('calls onRemoveFilter with the right key when a type chip is removed', () => {
    const props = setup({ filters: { ...filters, types: ['SEEDS'] } });

    fireEvent.click(screen.getByLabelText('Remove Seeds'));

    expect(props.onRemoveFilter).toHaveBeenCalledWith('type:SEEDS');
  });
});
