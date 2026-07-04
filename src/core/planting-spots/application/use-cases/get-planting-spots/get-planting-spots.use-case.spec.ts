import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPlantingSpotsUseCase } from './get-planting-spots.use-case';
import type { IPlantingSpotsRepository } from '@/core/planting-spots/application/ports/planting-spots.repository.port';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

const mockSpots: PlantingSpot[] = [
  {
    id: 'spot-1',
    name: 'Main Bed',
    type: 'RAISED_BED',
    description: null,
    userId: 'user-1',
    spaceId: 'space-1',
    status: 'ACTIVE',
    fallowSince: null,
    resolvedPlants: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockPaginatedResult: PaginatedResult<PlantingSpot> = {
  items: mockSpots,
  total: 1,
  page: 1,
  perPage: 20,
  totalPages: 1,
};

const mockRepository: IPlantingSpotsRepository = {
  list: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  waterAll: vi.fn(),
  markFallow: vi.fn(),
  markActive: vi.fn(),
};

describe('GetPlantingSpotsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated result from repository', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue(mockPaginatedResult);
    const useCase = new GetPlantingSpotsUseCase(mockRepository);

    const result = await useCase.execute(1, 20);

    expect(result).toEqual(mockPaginatedResult);
    expect(mockRepository.list).toHaveBeenCalledWith(1, 20);
  });

  it('returns empty result when repository returns no items', async () => {
    const empty: PaginatedResult<PlantingSpot> = { items: [], total: 0, page: 1, perPage: 20, totalPages: 1 };
    vi.mocked(mockRepository.list).mockResolvedValue(empty);
    const useCase = new GetPlantingSpotsUseCase(mockRepository);

    const result = await useCase.execute(1, 20);

    expect(result.items).toEqual([]);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.list).mockRejectedValue(new Error('Network error'));
    const useCase = new GetPlantingSpotsUseCase(mockRepository);

    await expect(useCase.execute(1, 20)).rejects.toThrow('Network error');
  });
});
