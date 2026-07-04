import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@/core/planting-spots/presentation/hooks/use-mark-planting-spot-fallow/use-mark-planting-spot-fallow.hook', () => ({
  useMarkPlantingSpotFallow: vi.fn(),
}));

vi.mock('@/core/planting-spots/presentation/hooks/use-mark-planting-spot-active/use-mark-planting-spot-active.hook', () => ({
  useMarkPlantingSpotActive: vi.fn(),
}));

import { useMarkPlantingSpotFallow } from '@/core/planting-spots/presentation/hooks/use-mark-planting-spot-fallow/use-mark-planting-spot-fallow.hook';
import { useMarkPlantingSpotActive } from '@/core/planting-spots/presentation/hooks/use-mark-planting-spot-active/use-mark-planting-spot-active.hook';
import { usePlantingSpotStatusToggle } from './use-planting-spot-status-toggle.hook';

describe('usePlantingSpotStatusToggle', () => {
  const markFallowMutate = vi.fn();
  const markActiveMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMarkPlantingSpotFallow).mockReturnValue({ mutate: markFallowMutate, isPending: false } as never);
    vi.mocked(useMarkPlantingSpotActive).mockReturnValue({ mutate: markActiveMutate, isPending: false } as never);
  });

  it('reports isFallow=false for an ACTIVE spot', () => {
    const { result } = renderHook(() => usePlantingSpotStatusToggle('spot-1', 'ACTIVE'));
    expect(result.current.isFallow).toBe(false);
  });

  it('reports isFallow=true for a FALLOW spot', () => {
    const { result } = renderHook(() => usePlantingSpotStatusToggle('spot-1', 'FALLOW'));
    expect(result.current.isFallow).toBe(true);
  });

  it('toggle() calls markFallow.mutate with the spot id when the spot is active', () => {
    const { result } = renderHook(() => usePlantingSpotStatusToggle('spot-1', 'ACTIVE'));
    result.current.toggle();
    expect(markFallowMutate).toHaveBeenCalledWith('spot-1');
    expect(markActiveMutate).not.toHaveBeenCalled();
  });

  it('toggle() calls markActive.mutate with the spot id when the spot is fallow', () => {
    const { result } = renderHook(() => usePlantingSpotStatusToggle('spot-1', 'FALLOW'));
    result.current.toggle();
    expect(markActiveMutate).toHaveBeenCalledWith('spot-1');
    expect(markFallowMutate).not.toHaveBeenCalled();
  });

  it('isPending is true when either mutation is pending', () => {
    vi.mocked(useMarkPlantingSpotFallow).mockReturnValue({ mutate: markFallowMutate, isPending: true } as never);
    const { result } = renderHook(() => usePlantingSpotStatusToggle('spot-1', 'ACTIVE'));
    expect(result.current.isPending).toBe(true);
  });
});
