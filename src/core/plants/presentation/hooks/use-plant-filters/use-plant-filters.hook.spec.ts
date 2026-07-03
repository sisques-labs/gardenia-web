import { act, renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { usePlantFilters } from './use-plant-filters.hook';

describe('usePlantFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty search and no filters', () => {
    const { result } = renderHook(() => usePlantFilters());

    expect(result.current.search).toBe('');
    expect(result.current.filters).toEqual([]);
  });

  it('updates search immediately, before the debounce delay elapses', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('rose'));

    expect(result.current.search).toBe('rose');
    expect(result.current.filters).toEqual([]);
  });

  it('builds a NAME/LIKE filter only after the debounce delay elapses', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('rose'));
    act(() => vi.advanceTimersByTime(300));

    expect(result.current.search).toBe('rose');
    expect(result.current.filters).toEqual([{ field: 'NAME', operator: 'LIKE', value: 'rose' }]);
  });

  it('does not build a filter before the debounce delay elapses', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('rose'));
    act(() => vi.advanceTimersByTime(299));

    expect(result.current.filters).toEqual([]);
  });

  it('resets the debounce timer on every keystroke (only the final value is queried)', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('ro'));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.setSearch('rose'));
    act(() => vi.advanceTimersByTime(200));
    expect(result.current.filters).toEqual([]);

    act(() => vi.advanceTimersByTime(100));
    expect(result.current.filters).toEqual([{ field: 'NAME', operator: 'LIKE', value: 'rose' }]);
  });

  it('trims whitespace and treats a blank search as no filter', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('   '));
    act(() => vi.advanceTimersByTime(300));

    expect(result.current.filters).toEqual([]);
  });

  it('trims surrounding whitespace from the filter value', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('  rose  '));
    act(() => vi.advanceTimersByTime(300));

    expect(result.current.filters).toEqual([{ field: 'NAME', operator: 'LIKE', value: 'rose' }]);
  });

  it('clears filters when search is reset to empty', () => {
    const { result } = renderHook(() => usePlantFilters());

    act(() => result.current.setSearch('rose'));
    act(() => vi.advanceTimersByTime(300));
    act(() => result.current.setSearch(''));
    act(() => vi.advanceTimersByTime(300));

    expect(result.current.filters).toEqual([]);
  });
});
