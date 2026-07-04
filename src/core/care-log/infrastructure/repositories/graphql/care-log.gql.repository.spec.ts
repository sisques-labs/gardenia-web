import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { CareLogGqlRepository } from './care-log.gql.repository';
import { CareLogActivityType } from '@/core/care-log/domain/interfaces/care-log-entry.interface';
import type { CareLogEntry } from '@/core/care-log/domain/interfaces/care-log-entry.interface';

const mockEntry: CareLogEntry = {
  id: 'entry-1',
  plantId: 'plant-1',
  activityType: CareLogActivityType.WATERING,
  performedAt: '2024-01-10T10:00:00.000Z',
};

describe('CareLogGqlRepository', () => {
  let repository: CareLogGqlRepository;

  beforeEach(() => {
    repository = new CareLogGqlRepository();
    vi.clearAllMocks();
  });

  it('findByPlantId() llama a careLogFindByCriteria con las variables correctas', async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { careLogFindByCriteria: { items: [mockEntry], total: 1, page: 1, perPage: 50 } },
    } as never);

    await repository.findByPlantId('plant-1');

    expect(apolloClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            filters: [{ field: 'PLANT_ID', operator: 'EQUALS', value: 'plant-1' }],
            pagination: { page: 1, perPage: 50 },
          },
        },
        fetchPolicy: 'network-only',
      }),
    );
  });

  it('retorna los items de la respuesta', async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { careLogFindByCriteria: { items: [mockEntry], total: 1, page: 1, perPage: 50 } },
    } as never);

    const result = await repository.findByPlantId('plant-1');

    expect(result).toEqual([mockEntry]);
  });

  it('respeta el limit personalizado', async () => {
    vi.mocked(apolloClient.query).mockResolvedValue({
      data: { careLogFindByCriteria: { items: [], total: 0, page: 1, perPage: 10 } },
    } as never);

    await repository.findByPlantId('plant-1', 10);

    expect(apolloClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          input: {
            filters: [{ field: 'PLANT_ID', operator: 'EQUALS', value: 'plant-1' }],
            pagination: { page: 1, perPage: 10 },
          },
        },
        fetchPolicy: 'network-only',
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

  describe('create()', () => {
    it('llama a apolloClient.mutate con CARE_LOG_ENTRY_CREATE y retorna solo el id creado', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careLogEntryCreate: { id: 'entry-1', success: true, message: 'Created' } },
      } as never);

      const input = { plantId: 'plant-1', activityType: CareLogActivityType.WATERING };
      const result = await repository.create(input);

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: { input },
      });
      expect(result).toEqual({ id: 'entry-1' });
    });

    it('lanza un error cuando success es false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careLogEntryCreate: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(
        repository.create({ plantId: 'plant-1', activityType: CareLogActivityType.WATERING }),
      ).rejects.toThrow('careLogEntryCreate mutation failed');
    });
  });
});
