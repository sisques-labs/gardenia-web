import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetHarvestsUseCase } from './get-harvests.use-case';
import type { IHarvestsRepository } from '@/core/harvests/application/ports/harvests.repository.port';
import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';

const mockHarvests: Harvest[] = [
  {
    id: 'harvest-1',
    cropType: 'Tomato',
    quantity: 5,
    unit: 'KG',
    harvestedAt: '2024-06-01',
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'harvest-2',
    cropType: 'Lettuce',
    quantity: 3,
    unit: 'PIECES',
    harvestedAt: '2024-06-02',
    userId: 'user-1',
    spaceId: 'space-1',
    createdAt: '2024-06-02',
    updatedAt: '2024-06-02',
  },
];

const mockRepository: IHarvestsRepository = {
  findByCriteria: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('GetHarvestsUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns list from repository', async () => {
    vi.mocked(mockRepository.findByCriteria).mockResolvedValue(mockHarvests);
    const useCase = new GetHarvestsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual(mockHarvests);
    expect(mockRepository.findByCriteria).toHaveBeenCalledOnce();
  });

  it('returns empty array when repository returns empty', async () => {
    vi.mocked(mockRepository.findByCriteria).mockResolvedValue([]);
    const useCase = new GetHarvestsUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(mockRepository.findByCriteria).toHaveBeenCalledOnce();
  });

  it('propagates repository error unchanged', async () => {
    vi.mocked(mockRepository.findByCriteria).mockRejectedValue(new Error('Network error'));
    const useCase = new GetHarvestsUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrow('Network error');
  });
});
