import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';

const mockCreateMutate = vi.hoisted(() => vi.fn());
const mockUpdateMutate = vi.hoisted(() => vi.fn());

vi.mock('@/core/harvests/presentation/hooks/use-create-harvest/use-create-harvest.hook', () => ({
  useCreateHarvest: vi.fn(() => ({
    mutate: mockCreateMutate,
    isPending: false,
  })),
}));

vi.mock('@/core/harvests/presentation/hooks/use-update-harvest/use-update-harvest.hook', () => ({
  useUpdateHarvest: vi.fn(() => ({
    mutate: mockUpdateMutate,
    isPending: false,
  })),
}));

import { useHarvestForm } from './use-harvest-form.hook';

const mockHarvest: Harvest = {
  id: 'h1',
  cropType: 'Tomato',
  quantity: 2.5,
  unit: 'KG',
  harvestedAt: '2026-06-01',
  userId: 'u1',
  spaceId: 's1',
  createdAt: '2026-06-01',
  updatedAt: '2026-06-01',
};

describe('useHarvestForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls createHarvest on submit in create mode', async () => {
    mockCreateMutate.mockImplementation((_values: unknown, options: { onSuccess: () => void }) => {
      options.onSuccess();
    });

    const onClose = vi.fn();
    const { result } = renderHook(() => useHarvestForm({ onClose }));

    await act(async () => {
      result.current.form.setValue('cropType', 'Lettuce');
      result.current.form.setValue('quantity', 3);
      result.current.form.setValue('harvestedAt', '2026-06-10');
      result.current.form.setValue('unit', 'KG');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ cropType: 'Lettuce', quantity: 3, harvestedAt: '2026-06-10' }),
      expect.any(Object),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('calls updateHarvest on submit in edit mode', async () => {
    mockUpdateMutate.mockImplementation((_values: unknown, options: { onSuccess: () => void }) => {
      options.onSuccess();
    });

    const onClose = vi.fn();
    const { result } = renderHook(() => useHarvestForm({ harvest: mockHarvest, onClose }));

    await act(async () => {
      await result.current.onSubmit();
    });

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'h1' }),
      expect.any(Object),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('returns selectedUnit from form watch', () => {
    const { result } = renderHook(() => useHarvestForm({ onClose: vi.fn() }));

    expect(result.current.selectedUnit).toBe('KG');
  });

  it('pre-fills form values when harvest is provided', () => {
    const { result } = renderHook(() => useHarvestForm({ harvest: mockHarvest, onClose: vi.fn() }));

    expect(result.current.form.getValues()).toMatchObject({
      cropType: 'Tomato',
      quantity: 2.5,
      unit: 'KG',
      harvestedAt: '2026-06-01',
    });
  });
});
