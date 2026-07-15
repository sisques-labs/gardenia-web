import { describe, it, expect, vi } from 'vitest';
import { SearchSpeciesUseCase } from './search-species.use-case';
import type { IPlantsRepository } from '@/core/plants/application/ports/plants.repository.port';

describe('SearchSpeciesUseCase', () => {
  const mockRepo: IPlantsRepository = {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    searchSpecies: vi.fn().mockResolvedValue([
      { gbifKey: 2882337, scientificName: 'Monstera deliciosa' },
    ]),
  };

  it('delegates to repository.searchSpecies and returns the results', async () => {
    const useCase = new SearchSpeciesUseCase(mockRepo);
    const result = await useCase.execute('Monstera', 10);
    expect(mockRepo.searchSpecies).toHaveBeenCalledWith('Monstera', 10);
    expect(result).toEqual([{ gbifKey: 2882337, scientificName: 'Monstera deliciosa' }]);
  });

  it('returns an empty array when nothing matches', async () => {
    vi.mocked(mockRepo.searchSpecies).mockResolvedValueOnce([]);
    const useCase = new SearchSpeciesUseCase(mockRepo);
    const result = await useCase.execute('zzznonsense');
    expect(result).toEqual([]);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepo.searchSpecies).mockRejectedValueOnce(new Error('Search failed'));
    const useCase = new SearchSpeciesUseCase(mockRepo);
    await expect(useCase.execute('Monstera')).rejects.toThrow('Search failed');
  });
});
