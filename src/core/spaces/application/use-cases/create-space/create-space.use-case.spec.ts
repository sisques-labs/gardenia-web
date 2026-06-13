import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateSpaceUseCase } from './create-space.use-case';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';

const newSpace: Space = { id: 'space-new', name: 'New Space', ownerId: 'user-1', createdAt: '2024-01-01' };

const mockRepository: ISpacesRepository = {
  listByUser: vi.fn(),
  create: vi.fn(),
  acceptInvitation: vi.fn(),
};

describe('CreateSpaceUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates and returns the new space', async () => {
    vi.mocked(mockRepository.create).mockResolvedValue(newSpace);
    const useCase = new CreateSpaceUseCase(mockRepository);

    const result = await useCase.execute('New Space');

    expect(result).toEqual(newSpace);
    expect(mockRepository.create).toHaveBeenCalledWith('New Space');
  });
});
