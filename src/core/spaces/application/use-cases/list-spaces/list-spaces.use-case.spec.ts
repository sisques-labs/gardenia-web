import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListSpacesUseCase } from './list-spaces.use-case';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

const mockSpaces: Space[] = [
  { id: 'space-1', name: 'My Space', ownerId: 'user-1', createdAt: '2024-01-01' },
];

const mockRepository: ISpacesRepository = {
  listByUser: vi.fn(),
  create: vi.fn(),
  acceptInvitation: vi.fn(),
  findById: vi.fn(),
  createInvitation: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  getSpaceWeather: vi.fn(),
  update: vi.fn(),
};

describe('ListSpacesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and returns spaces', async () => {
    vi.mocked(mockRepository.listByUser).mockResolvedValue(mockSpaces);
    const useCase = new ListSpacesUseCase(mockRepository);

    const result = await useCase.execute();

    expect(result).toEqual(mockSpaces);
  });

  it('propagates repository errors', async () => {
    vi.mocked(mockRepository.listByUser).mockRejectedValue(new Error('Network error'));
    const useCase = new ListSpacesUseCase(mockRepository);

    await expect(useCase.execute()).rejects.toThrow('Network error');
  });
});
