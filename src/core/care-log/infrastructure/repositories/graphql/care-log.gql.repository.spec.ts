import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { CareLogGqlRepository } from './care-log.gql.repository';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

const mockEntry: CareLogEntry = {
  id: 'entry-1',
  plantId: 'plant-1',
  userId: 'user-1',
  spaceId: 'space-1',
  activityType: CareLogActivityType.WATERING,
  performedAt: '2024-01-10T10:00:00.000Z',
  notes: null,
  quantity: null,
  unit: null,
  createdAt: '2024-01-10T10:00:00.000Z',
  updatedAt: '2024-01-10T10:00:00.000Z',
};

describe('CareLogGqlRepository', () => {
  let repository: CareLogGqlRepository;

  beforeEach(() => {
    repository = new CareLogGqlRepository();
    vi.clearAllMocks();
  });

  it('findByPlantId() llama a careLogFindByCriteria con las variables correctas', async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { careLogFindByCriteria: { items: [mockEntry], total: 1, page: 1, perPage: 50, totalPages: 1 } },
    } as never);

    await repository.findByPlantId('plant-1');

    expect(apolloClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { plantId: 'plant-1', page: 1, limit: 50 } },
      }),
    );
  });

  it('retorna los items de la respuesta', async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { careLogFindByCriteria: { items: [mockEntry], total: 1, page: 1, perPage: 50, totalPages: 1 } },
    } as never);

    const result = await repository.findByPlantId('plant-1');

    expect(result).toEqual([mockEntry]);
  });

  it('respeta el limit personalizado', async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { careLogFindByCriteria: { items: [], total: 0, page: 1, perPage: 10, totalPages: 0 } },
    } as never);

    await repository.findByPlantId('plant-1', 10);

    expect(apolloClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { input: { plantId: 'plant-1', page: 1, limit: 10 } },
      }),
    );
  });

  it('retorna [] si careLogFindByCriteria es null', async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { careLogFindByCriteria: null },
    } as never);

    const result = await repository.findByPlantId('plant-1');

    expect(result).toEqual([]);
  });
});
