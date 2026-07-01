import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import { toISODate } from '@/core/care-schedule/presentation/utils/to-iso-date/to-iso-date.util';

const mockCreateMutate = vi.hoisted(() => vi.fn());
const mockUpdateMutate = vi.hoisted(() => vi.fn());

vi.mock('@/core/care-schedule/presentation/hooks/use-create-care-schedule/use-create-care-schedule.hook', () => ({
  useCreateCareSchedule: () => ({ mutate: mockCreateMutate, isPending: false }),
}));

vi.mock('@/core/care-schedule/presentation/hooks/use-update-care-schedule/use-update-care-schedule.hook', () => ({
  useUpdateCareSchedule: () => ({ mutate: mockUpdateMutate, isPending: false }),
}));

import { useCareScheduleForm } from './use-care-schedule-form.hook';

const mockCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'FERTILIZING',
  intervalDays: 14,
  quantity: 5,
  unit: 'ML',
  notes: 'some notes',
  nextDueAt: '2026-07-10',
  lastCompletedAt: null,
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-01',
};

describe('useCareScheduleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to a recurring schedule in creation mode, with lockedPlantId prefilled', () => {
    const { result } = renderHook(() => useCareScheduleForm({ lockedPlantId: 'plant-1', onClose: vi.fn() }));

    expect(result.current.isRecurring).toBe(true);
    expect(result.current.plantId).toBe('plant-1');
  });

  it('preloads values from the given careSchedule in edit mode', () => {
    const { result } = renderHook(() => useCareScheduleForm({ careSchedule: mockCareSchedule, onClose: vi.fn() }));

    expect(result.current.activityType).toBe('FERTILIZING');
    expect(result.current.unit).toBe('ML');
    expect(result.current.isRecurring).toBe(true);
  });

  it('marks isRecurring false when the careSchedule has no intervalDays', () => {
    const { result } = renderHook(() =>
      useCareScheduleForm({ careSchedule: { ...mockCareSchedule, intervalDays: null }, onClose: vi.fn() }),
    );

    expect(result.current.isRecurring).toBe(false);
  });

  it('forces intervalDays to null on submit when isRecurring is turned off', async () => {
    const onClose = vi.fn();
    mockCreateMutate.mockImplementation((_input, opts) => opts?.onSuccess?.());

    const { result } = renderHook(() => useCareScheduleForm({ lockedPlantId: 'plant-1', onClose }));

    act(() => {
      result.current.form.setValue('activityType', 'WATERING');
      result.current.setIsRecurring(false);
    });

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never);
    });

    await waitFor(() =>
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ plantId: 'plant-1', activityType: 'WATERING', intervalDays: null }),
        expect.anything(),
      ),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('defaults nextDueAt to today in creation mode', () => {
    const { result } = renderHook(() => useCareScheduleForm({ lockedPlantId: 'plant-1', onClose: vi.fn() }));

    expect(result.current.form.getValues('nextDueAt')).toBe(toISODate(new Date()));
  });

  it('sends nextDueAt as a full ISO datetime on create, built from the chosen day', async () => {
    const onClose = vi.fn();
    mockCreateMutate.mockImplementation((_input, opts) => opts?.onSuccess?.());

    const { result } = renderHook(() => useCareScheduleForm({ lockedPlantId: 'plant-1', onClose }));

    act(() => {
      result.current.form.setValue('nextDueAt', '2026-08-15');
    });

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never);
    });

    await waitFor(() => expect(mockCreateMutate).toHaveBeenCalled());
    const sentInput = mockCreateMutate.mock.calls[0][0];
    expect(sentInput.nextDueAt).toContain('2026-08-15');
  });

  it('does not block submission when quantity is left blank', async () => {
    const onClose = vi.fn();
    mockCreateMutate.mockImplementation((_input, opts) => opts?.onSuccess?.());

    const { result } = renderHook(() => useCareScheduleForm({ lockedPlantId: 'plant-1', onClose }));

    act(() => {
      result.current.form.setValue('quantity', '' as unknown as number);
    });

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never);
    });

    await waitFor(() => expect(mockCreateMutate).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls update with the schedule id when editing', async () => {
    const onClose = vi.fn();
    mockUpdateMutate.mockImplementation((_input, opts) => opts?.onSuccess?.());

    const { result } = renderHook(() => useCareScheduleForm({ careSchedule: mockCareSchedule, onClose }));

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never);
    });

    await waitFor(() =>
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'cs-1' }),
        expect.anything(),
      ),
    );
  });
});
