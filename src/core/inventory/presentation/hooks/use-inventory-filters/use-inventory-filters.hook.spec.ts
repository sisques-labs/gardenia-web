import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InventoryItemQueryableField } from '@/core/inventory/domain/enums/inventory-item-queryable-field.enum';
import { FilterOperator } from '@/shared/domain/enums/filter-operator.enum';
import { useInventoryFilters } from './use-inventory-filters.hook';

describe('useInventoryFilters', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts with no active filters', () => {
    const { result } = renderHook(() => useInventoryFilters());
    expect(result.current.filters).toEqual([]);
  });

  it('does not add a name filter until the debounce delay has passed', () => {
    const { result } = renderHook(() => useInventoryFilters());

    act(() => result.current.setQuery('lettuce'));
    expect(result.current.filters).toEqual([]);

    act(() => vi.advanceTimersByTime(300));
    expect(result.current.filters).toEqual([
      { field: InventoryItemQueryableField.NAME, operator: FilterOperator.LIKE, value: 'lettuce' },
    ]);
  });

  it('does not fire a filter for a debounced empty/whitespace search', () => {
    const { result } = renderHook(() => useInventoryFilters());

    act(() => result.current.setQuery('   '));
    act(() => vi.advanceTimersByTime(300));

    expect(result.current.filters).toEqual([]);
  });

  it('adds an itemType filter when a type is selected', () => {
    const { result } = renderHook(() => useInventoryFilters());

    act(() => result.current.setType('SEEDS'));

    expect(result.current.filters).toEqual([
      { field: InventoryItemQueryableField.ITEM_TYPE, operator: FilterOperator.EQUALS, value: 'SEEDS' },
    ]);
  });

  it('clears the itemType filter when set back to ALL', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => result.current.setType('SEEDS'));
    act(() => result.current.setType('ALL'));

    expect(result.current.filters).toEqual([]);
  });

  it('adds a low_stock filter when toggled on', () => {
    const { result } = renderHook(() => useInventoryFilters());

    act(() => result.current.toggleLowStock());

    expect(result.current.filters).toEqual([
      { field: InventoryItemQueryableField.LOW_STOCK, operator: FilterOperator.EQUALS, value: true },
    ]);
  });

  it('adds an expiresAt filter when expiring-soon is toggled on', () => {
    vi.setSystemTime(new Date('2026-06-01T00:00:00.000Z'));
    const { result } = renderHook(() => useInventoryFilters());

    act(() => result.current.toggleExpiringSoon());

    expect(result.current.filters).toEqual([
      {
        field: InventoryItemQueryableField.EXPIRES_AT,
        operator: FilterOperator.LESS_THAN_OR_EQUAL,
        value: new Date('2026-07-01T00:00:00.000Z'),
      },
    ]);
  });

  it('combines multiple active filters', () => {
    const { result } = renderHook(() => useInventoryFilters());

    act(() => result.current.setType('SEEDS'));
    act(() => result.current.toggleLowStock());

    expect(result.current.filters).toHaveLength(2);
  });

  it('removeFilter("search") clears only the search term', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => result.current.setType('SEEDS'));
    act(() => result.current.setQuery('lettuce'));
    act(() => vi.advanceTimersByTime(300));

    act(() => result.current.removeFilter('search'));

    expect(result.current.filterState.query).toBe('');
    expect(result.current.filterState.type).toBe('SEEDS');
  });

  it('removeFilter("type") resets type to ALL', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => result.current.setType('SEEDS'));

    act(() => result.current.removeFilter('type'));

    expect(result.current.filterState.type).toBe('ALL');
  });

  it('removeFilter("lowStock") turns the toggle off', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => result.current.toggleLowStock());

    act(() => result.current.removeFilter('lowStock'));

    expect(result.current.filterState.lowStockOnly).toBe(false);
  });

  it('removeFilter("expiringSoon") turns the toggle off', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => result.current.toggleExpiringSoon());

    act(() => result.current.removeFilter('expiringSoon'));

    expect(result.current.filterState.expiringSoonOnly).toBe(false);
  });
});
