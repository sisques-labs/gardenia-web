import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import enInventory from '@/core/inventory/presentation/i18n/en';
import type { InventoryFiltersState } from '@/core/inventory/presentation/hooks/use-inventory-filters/inventory-filters-state.interface';
import { InventoryFilters } from './inventory-filters';

const dict = enInventory as AppDict['inventory'];

const filters: InventoryFiltersState = {
  query: '',
  type: 'ALL',
  lowStockOnly: false,
  expiringSoonOnly: false,
};

function setup(overrides: Partial<React.ComponentProps<typeof InventoryFilters>> = {}) {
  const props = {
    dict,
    filters,
    onQueryChange: vi.fn(),
    onTypeChange: vi.fn(),
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

  it('renders no chips when no filters are active', () => {
    setup();
    expect(screen.queryByText(/Search:/)).not.toBeInTheDocument();
  });

  it('renders a chip per active filter', () => {
    setup({
      filters: { query: 'lettuce', type: 'SEEDS', lowStockOnly: true, expiringSoonOnly: true },
    });

    expect(screen.getByText('Search: lettuce')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Seeds')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Low stock')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Expiring soon')).toBeInTheDocument();
  });

  it('calls onRemoveFilter with the right key when a chip is removed', () => {
    const props = setup({ filters: { ...filters, type: 'SEEDS' } });

    fireEvent.click(screen.getByLabelText('Remove Seeds'));

    expect(props.onRemoveFilter).toHaveBeenCalledWith('type');
  });
});
