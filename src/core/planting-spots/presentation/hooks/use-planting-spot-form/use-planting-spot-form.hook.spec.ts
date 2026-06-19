import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockPush = vi.hoisted(() => vi.fn());
const mockCreateMutate = vi.hoisted(() => vi.fn());
const mockUpdateMutate = vi.hoisted(() => vi.fn());
const mockDeleteMutate = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook',
  () => ({ usePlantingSpot: vi.fn() }),
);

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook',
  () => ({ useCreatePlantingSpot: vi.fn() }),
);

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook',
  () => ({ useUpdatePlantingSpot: vi.fn() }),
);

vi.mock(
  '@/core/planting-spots/presentation/hooks/use-delete-planting-spot/use-delete-planting-spot.hook',
  () => ({ useDeletePlantingSpot: vi.fn() }),
);

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    useForm: vi.fn().mockReturnValue({
      register: vi.fn().mockReturnValue({}),
      handleSubmit: (fn: (v: unknown) => void) => fn,
      control: {},
      setValue: vi.fn(),
      watch: vi.fn().mockReturnValue(undefined),
      formState: { errors: {} },
    }),
  };
});

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn().mockReturnValue(vi.fn()),
}));

import { usePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook';
import { useCreatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook';
import { useUpdatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook';
import { useDeletePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-delete-planting-spot/use-delete-planting-spot.hook';
import { usePlantingSpotForm } from './use-planting-spot-form.hook';

const mockSpot = {
  id: 'spot-1',
  name: 'Main Bed',
  type: 'RAISED_BED' as const,
  description: 'Nice bed',
  capacity: 5,
  row: 1,
  column: 2,
  dimensionsWidth: null,
  dimensionsHeight: null,
  dimensionsLength: null,
  soilType: null,
  userId: 'u1',
  spaceId: 's1',
  resolvedPlants: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const formValues = {
  name: 'Test Spot',
  type: 'RAISED_BED' as const,
  description: 'A description',
  capacity: null,
  row: null,
  column: null,
  dimensionsWidth: null,
  dimensionsHeight: null,
  dimensionsLength: null,
  soilType: '',
};

function setupMocks({
  spot = null,
  isLoading = false,
  createPending = false,
  updatePending = false,
}: {
  spot?: typeof mockSpot | null;
  isLoading?: boolean;
  createPending?: boolean;
  updatePending?: boolean;
} = {}) {
  vi.mocked(usePlantingSpot).mockReturnValue({ spot, isLoading, error: null } as never);
  vi.mocked(useCreatePlantingSpot).mockReturnValue({
    mutate: mockCreateMutate,
    isPending: createPending,
  } as never);
  vi.mocked(useUpdatePlantingSpot).mockReturnValue({
    mutate: mockUpdateMutate,
    isPending: updatePending,
  } as never);
  vi.mocked(useDeletePlantingSpot).mockReturnValue({
    mutate: mockDeleteMutate,
    isPending: false,
  } as never);
}

describe('usePlantingSpotForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isEdit', () => {
    it('is false in create mode', () => {
      setupMocks();
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'create', lang: 'en' }),
      );
      expect(result.current.isEdit).toBe(false);
    });

    it('is true in edit mode', () => {
      setupMocks({ spot: mockSpot });
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'edit', spotId: 'spot-1', lang: 'en' }),
      );
      expect(result.current.isEdit).toBe(true);
    });
  });

  describe('isPending', () => {
    it('is false when neither mutation is pending', () => {
      setupMocks();
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'create', lang: 'en' }),
      );
      expect(result.current.isPending).toBe(false);
    });

    it('is true when createMutation is pending', () => {
      setupMocks({ createPending: true });
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'create', lang: 'en' }),
      );
      expect(result.current.isPending).toBe(true);
    });

    it('is true when updateMutation is pending', () => {
      setupMocks({ updatePending: true });
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'edit', spotId: 'spot-1', lang: 'en' }),
      );
      expect(result.current.isPending).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('calls createMutation in create mode', () => {
      setupMocks();
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'create', lang: 'en' }),
      );
      act(() => {
        result.current.onSubmit(formValues);
      });
      expect(mockCreateMutate).toHaveBeenCalledTimes(1);
      expect(mockUpdateMutate).not.toHaveBeenCalled();
    });

    it('calls updateMutation in edit mode with spotId', () => {
      setupMocks({ spot: mockSpot });
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'edit', spotId: 'spot-1', lang: 'en' }),
      );
      act(() => {
        result.current.onSubmit(formValues);
      });
      expect(mockUpdateMutate).toHaveBeenCalledTimes(1);
      expect(mockCreateMutate).not.toHaveBeenCalled();
    });

    it('falls back to createMutation in edit mode without spotId', () => {
      setupMocks();
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'edit', lang: 'en' }),
      );
      act(() => {
        result.current.onSubmit(formValues);
      });
      expect(mockCreateMutate).toHaveBeenCalledTimes(1);
      expect(mockUpdateMutate).not.toHaveBeenCalled();
    });

    it('converts empty description to null', () => {
      setupMocks();
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'create', lang: 'en' }),
      );
      act(() => {
        result.current.onSubmit({ ...formValues, description: '' });
      });
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ description: null }),
        expect.any(Object),
      );
    });

    it('converts non-empty description to string value', () => {
      setupMocks();
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'create', lang: 'en' }),
      );
      act(() => {
        result.current.onSubmit({ ...formValues, description: 'My spot' });
      });
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'My spot' }),
        expect.any(Object),
      );
    });

    it('converts empty soilType to null', () => {
      setupMocks();
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'create', lang: 'en' }),
      );
      act(() => {
        result.current.onSubmit({ ...formValues, soilType: '' });
      });
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({ soilType: null }),
        expect.any(Object),
      );
    });
  });

  describe('handleDelete', () => {
    it('calls deleteMutation when spotId is provided', () => {
      setupMocks({ spot: mockSpot });
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'edit', spotId: 'spot-1', lang: 'en' }),
      );
      act(() => {
        result.current.handleDelete();
      });
      expect(mockDeleteMutate).toHaveBeenCalledWith('spot-1', expect.any(Object));
    });

    it('does not call deleteMutation when spotId is undefined', () => {
      setupMocks();
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'create', lang: 'en' }),
      );
      act(() => {
        result.current.handleDelete();
      });
      expect(mockDeleteMutate).not.toHaveBeenCalled();
    });

    it('closes the delete dialog after handling', () => {
      setupMocks({ spot: mockSpot });
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'edit', spotId: 'spot-1', lang: 'en' }),
      );
      act(() => {
        result.current.setDeleteOpen(true);
      });
      expect(result.current.deleteOpen).toBe(true);
      act(() => {
        result.current.handleDelete();
      });
      expect(result.current.deleteOpen).toBe(false);
    });
  });

  describe('navigateToList', () => {
    it('pushes to planting-spots route', () => {
      setupMocks();
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'create', lang: 'en' }),
      );
      act(() => {
        result.current.navigateToList();
      });
      expect(mockPush).toHaveBeenCalledWith('/en/planting-spots');
    });
  });

  describe('spot data', () => {
    it('exposes spot from usePlantingSpot', () => {
      setupMocks({ spot: mockSpot });
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'edit', spotId: 'spot-1', lang: 'en' }),
      );
      expect(result.current.spot).toEqual(mockSpot);
    });

    it('isLoading reflects hook loading state', () => {
      setupMocks({ isLoading: true });
      const { result } = renderHook(() =>
        usePlantingSpotForm({ mode: 'edit', spotId: 'spot-1', lang: 'en' }),
      );
      expect(result.current.isLoading).toBe(true);
    });
  });
});
