import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPlantsUseCase } from './get-plants.use-case';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';

const mockPlants: Plant[] = [
  {
    id: 'plant-1',
    name: 'Monstera',
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'plant-2',
    name: 'Pothos',
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];

function paginated(items: Plant[]): PaginatedResult<Plant> {
  return { items, total: items.length, page: 1, perPage: 10, totalPages: 1 };
}

const mockRepository: IPlantsRepository = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('GetPlantsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns plants from repository', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue(paginated(mockPlants));
    const useCase = new GetPlantsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual(paginated(mockPlants));
    expect(mockRepository.list).toHaveBeenCalledOnce();
  });

  it('returns empty result when repository returns no plants', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue(paginated([]));
    const useCase = new GetPlantsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result.items).toEqual([]);
    expect(mockRepository.list).toHaveBeenCalledOnce();
  });

  it('forwards criteria to the repository', async () => {
    vi.mocked(mockRepository.list).mockResolvedValue(paginated(mockPlants));
    const useCase = new GetPlantsUseCase(mockRepository);
    const criteria = { pagination: { page: 2, perPage: 5 } };

    await useCase.execute(criteria);

    expect(mockRepository.list).toHaveBeenCalledWith(criteria);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.list).mockRejectedValue(new Error('Network error'));
    const useCase = new GetPlantsUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrow('Network error');
  });
});
