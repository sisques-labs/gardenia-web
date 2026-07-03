import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentNode } from '@apollo/client';

vi.mock('@/shared/infrastructure/http/apollo.client', () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
  },
}));

import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { CareScheduleGqlRepository } from './care-schedule.gql.repository';
import { CARE_SCHEDULES_FIND_BY_CRITERIA } from './queries/care-schedule-find-by-criteria.query';
import { CARE_SCHEDULE_FIND_BY_ID } from './queries/care-schedule-find-by-id.query';
import { CARE_SCHEDULE_CREATE } from './mutations/care-schedule-create.mutation';
import { CARE_SCHEDULE_UPDATE } from './mutations/care-schedule-update.mutation';
import { CARE_SCHEDULE_COMPLETE } from './mutations/care-schedule-complete.mutation';
import { CARE_SCHEDULE_DELETE } from './mutations/care-schedule-delete.mutation';
import { CARE_SCHEDULE_WATER_PLANT } from './mutations/care-schedule-water-plant.mutation';
import type { CareSchedule, WaterPlantResult } from '@/core/care-schedule/domain/types/care-schedule.interface';

const mockCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'WATERING',
  intervalDays: 3,
  quantity: null,
  unit: null,
  notes: null,
  nextDueAt: '2026-07-05',
  lastCompletedAt: null,
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-01',
};

describe('CareScheduleGqlRepository', () => {
  let repository: CareScheduleGqlRepository;

  beforeEach(() => {
    repository = new CareScheduleGqlRepository();
    vi.clearAllMocks();
  });

  describe('GQL document constants', () => {
    it.each([
      ['CARE_SCHEDULES_FIND_BY_CRITERIA', CARE_SCHEDULES_FIND_BY_CRITERIA],
      ['CARE_SCHEDULE_FIND_BY_ID', CARE_SCHEDULE_FIND_BY_ID],
      ['CARE_SCHEDULE_CREATE', CARE_SCHEDULE_CREATE],
      ['CARE_SCHEDULE_UPDATE', CARE_SCHEDULE_UPDATE],
      ['CARE_SCHEDULE_COMPLETE', CARE_SCHEDULE_COMPLETE],
      ['CARE_SCHEDULE_DELETE', CARE_SCHEDULE_DELETE],
      ['CARE_SCHEDULE_WATER_PLANT', CARE_SCHEDULE_WATER_PLANT],
    ])('%s is a valid GQL document', (_name, doc) => {
      expect(doc).toBeDefined();
      expect((doc as DocumentNode).kind).toBe('Document');
    });
  });

  describe('findByCriteria()', () => {
    it('calls apolloClient.query with no filters when none are given', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careSchedulesFindByCriteria: { items: [mockCareSchedule] } },
      } as never);

      const result = await repository.findByCriteria();

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: CARE_SCHEDULES_FIND_BY_CRITERIA,
        variables: { input: undefined },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual([mockCareSchedule]);
    });

    it('translates plantId to a plant_id EQUALS filter', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careSchedulesFindByCriteria: { items: [] } },
      } as never);

      await repository.findByCriteria({ plantId: 'plant-1' });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: CARE_SCHEDULES_FIND_BY_CRITERIA,
        variables: {
          input: { filters: [{ field: 'plant_id', operator: 'EQUALS', value: 'plant-1' }] },
        },
        fetchPolicy: 'network-only',
      });
    });

    it('translates active + dueOnDay to an active EQUALS filter plus a next_due_at range bracketing that day', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careSchedulesFindByCriteria: { items: [] } },
      } as never);

      await repository.findByCriteria({ active: true, dueOnDay: '2026-07-05' });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: CARE_SCHEDULES_FIND_BY_CRITERIA,
        variables: {
          input: {
            filters: [
              { field: 'active', operator: 'EQUALS', value: 'true' },
              { field: 'next_due_at', operator: 'GREATER_THAN_OR_EQUAL', value: '2026-07-05T00:00:00.000' },
              { field: 'next_due_at', operator: 'LESS_THAN_OR_EQUAL', value: '2026-07-05T23:59:59.999' },
            ],
          },
        },
        fetchPolicy: 'network-only',
      });
    });

    it('sends active: false as the string "false", not an empty/falsy value', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careSchedulesFindByCriteria: { items: [] } },
      } as never);

      await repository.findByCriteria({ active: false });

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: CARE_SCHEDULES_FIND_BY_CRITERIA,
        variables: {
          input: { filters: [{ field: 'active', operator: 'EQUALS', value: 'false' }] },
        },
        fetchPolicy: 'network-only',
      });
    });

    it('returns empty array when items is empty', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careSchedulesFindByCriteria: { items: [] } },
      } as never);

      const result = await repository.findByCriteria();
      expect(result).toEqual([]);
    });
  });

  describe('findById()', () => {
    it('calls apolloClient.query with CARE_SCHEDULE_FIND_BY_ID and returns the item', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careScheduleFindById: mockCareSchedule },
      } as never);

      const result = await repository.findById('cs-1');

      expect(apolloClient.query).toHaveBeenCalledWith({
        query: CARE_SCHEDULE_FIND_BY_ID,
        variables: { input: { id: 'cs-1' } },
        fetchPolicy: 'network-only',
      });
      expect(result).toEqual(mockCareSchedule);
    });

    it('throws when careScheduleFindById is null', async () => {
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careScheduleFindById: null },
      } as never);

      await expect(repository.findById('cs-99')).rejects.toThrow('Care schedule not found: cs-99');
    });
  });

  describe('create()', () => {
    it('calls apolloClient.mutate with CARE_SCHEDULE_CREATE then re-fetches by id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careScheduleCreate: { id: 'cs-1', success: true, message: 'Created' } },
      } as never);
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careScheduleFindById: mockCareSchedule },
      } as never);

      const input = { plantId: 'plant-1', activityType: 'WATERING' as const, intervalDays: 3 };
      const result = await repository.create(input);

      expect(apolloClient.mutate).toHaveBeenCalledWith({ mutation: CARE_SCHEDULE_CREATE, variables: { input } });
      expect(result).toEqual(mockCareSchedule);
    });

    it('throws when mutation success is false', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careScheduleCreate: { id: '', success: false, message: 'Failed' } },
      } as never);

      await expect(
        repository.create({ plantId: 'plant-1', activityType: 'WATERING' }),
      ).rejects.toThrow('careScheduleCreate mutation failed');
    });
  });

  describe('update()', () => {
    it('calls apolloClient.mutate with CARE_SCHEDULE_UPDATE then re-fetches by id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careScheduleUpdate: { id: 'cs-1', success: true, message: 'Updated' } },
      } as never);
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careScheduleFindById: mockCareSchedule },
      } as never);

      const input = { id: 'cs-1', notes: 'updated' };
      const result = await repository.update(input);

      expect(apolloClient.mutate).toHaveBeenCalledWith({ mutation: CARE_SCHEDULE_UPDATE, variables: { input } });
      expect(result).toEqual(mockCareSchedule);
    });
  });

  describe('complete()', () => {
    it('calls apolloClient.mutate with CARE_SCHEDULE_COMPLETE then re-fetches by id', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careScheduleComplete: { id: 'cs-1', success: true, message: 'Completed' } },
      } as never);
      vi.mocked(apolloClient.query).mockResolvedValue({
        data: { careScheduleFindById: mockCareSchedule },
      } as never);

      const result = await repository.complete('cs-1', '2026-07-05');

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: CARE_SCHEDULE_COMPLETE,
        variables: { input: { id: 'cs-1', completedAt: '2026-07-05' } },
      });
      expect(result).toEqual(mockCareSchedule);
    });
  });

  describe('delete()', () => {
    it('calls apolloClient.mutate with CARE_SCHEDULE_DELETE and a bare id variable (no input wrapper)', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careScheduleDelete: { success: true, message: 'Deleted' } },
      } as never);

      const result = await repository.delete('cs-1');

      expect(result).toBeUndefined();
      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: CARE_SCHEDULE_DELETE,
        variables: { id: 'cs-1' },
      });
    });
  });

  describe('waterPlant()', () => {
    const mockWaterPlantResult: WaterPlantResult = {
      plantId: 'plant-1',
      mode: 'SCHEDULE_COMPLETED',
      careScheduleId: 'cs-1',
    };

    it('calls apolloClient.mutate with CARE_SCHEDULE_WATER_PLANT and returns the result as-is (no follow-up fetch)', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careScheduleWaterPlant: mockWaterPlantResult },
      } as never);

      const result = await repository.waterPlant('plant-1', '2026-07-05');

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: CARE_SCHEDULE_WATER_PLANT,
        variables: { input: { plantId: 'plant-1', performedAt: '2026-07-05' } },
      });
      expect(apolloClient.query).not.toHaveBeenCalled();
      expect(result).toEqual(mockWaterPlantResult);
    });

    it('calls apolloClient.mutate without performedAt when omitted', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careScheduleWaterPlant: { plantId: 'plant-1', mode: 'CARE_LOG_CREATED' } },
      } as never);

      await repository.waterPlant('plant-1');

      expect(apolloClient.mutate).toHaveBeenCalledWith({
        mutation: CARE_SCHEDULE_WATER_PLANT,
        variables: { input: { plantId: 'plant-1', performedAt: undefined } },
      });
    });

    it('throws when careScheduleWaterPlant is null', async () => {
      vi.mocked(apolloClient.mutate).mockResolvedValue({
        data: { careScheduleWaterPlant: null },
      } as never);

      await expect(repository.waterPlant('plant-1')).rejects.toThrow('careScheduleWaterPlant mutation failed');
    });
  });
});
