import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePlantFilters } from './use-plant-filters.hook';

describe('usePlantFilters', () => {
  it('starts with empty search and no filters', () => {
    const { result } = renderHook(() => usePlantFilters());

    expect(result.current.search).toBe('');
    expect(result.current.filters).toEqual([]);
  });

  it('builds a NAME/LIKE filter once search is set', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('rose'));

    expect(result.current.search).toBe('rose');
    expect(result.current.filters).toEqual([{ field: 'NAME', operator: 'LIKE', value: 'rose' }]);
  });

  it('trims whitespace and treats a blank search as no filter', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('   '));

    expect(result.current.filters).toEqual([]);
  });

  it('trims surrounding whitespace from the filter value', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('  rose  '));

    expect(result.current.filters).toEqual([{ field: 'NAME', operator: 'LIKE', value: 'rose' }]);
  });

  it('clears filters when search is reset to empty', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('rose'));
    act(() => result.current.setSearch(''));

    expect(result.current.filters).toEqual([]);
  });
});
