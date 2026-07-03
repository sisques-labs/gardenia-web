import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { ICareScheduleRepository } from '@/core/care-schedule/application/ports/care-schedule.repository.port';
import type { CareScheduleFilters } from '@/core/care-schedule/application/interfaces/care-schedule-filters.interface';
import type { CreateCareScheduleInput } from '@/core/care-schedule/application/interfaces/create-care-schedule-input.interface';
import type { UpdateCareScheduleInput } from '@/core/care-schedule/application/interfaces/update-care-schedule-input.interface';
import type { CareSchedule, WaterPlantResult } from '@/core/care-schedule/domain/types/care-schedule.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';
import { CARE_SCHEDULES_FIND_BY_CRITERIA } from './queries/care-schedule-find-by-criteria.query';
import { CARE_SCHEDULE_FIND_BY_ID } from './queries/care-schedule-find-by-id.query';
import { CARE_SCHEDULE_CREATE } from './mutations/care-schedule-create.mutation';
import { CARE_SCHEDULE_UPDATE } from './mutations/care-schedule-update.mutation';
import { CARE_SCHEDULE_COMPLETE } from './mutations/care-schedule-complete.mutation';
import { CARE_SCHEDULE_DELETE } from './mutations/care-schedule-delete.mutation';
import { CARE_SCHEDULE_WATER_PLANT } from './mutations/care-schedule-water-plant.mutation';
import type { CareSchedulesFindByCriteriaResponse } from './responses/care-schedule-find-by-criteria.response';
import type { CareScheduleFindByIdResponse } from './responses/care-schedule-find-by-id.response';
import type { CareScheduleCreateResponse } from './responses/care-schedule-create.response';
import type { CareScheduleUpdateResponse } from './responses/care-schedule-update.response';
import type { CareScheduleCompleteResponse } from './responses/care-schedule-complete.response';
import type { CareScheduleDeleteResponse } from './responses/care-schedule-delete.response';
import type { CareScheduleWaterPlantResponse } from './responses/care-schedule-water-plant.response';

// Filters use the API's snake_case column names — this mapping is confined to this repository.
// BaseFilterInput.value is a GraphQL String scalar, so every value must be sent as a string
// (a raw boolean fails variable coercion: "String cannot represent a non string value").
function toApiFilters(filters?: CareScheduleFilters) {
  if (!filters) return undefined;

  const apiFilters: { field: string; operator: string; value: string }[] = [];
  if (filters.plantId) apiFilters.push({ field: 'plant_id', operator: 'EQUALS', value: filters.plantId });
  if (filters.activityType) apiFilters.push({ field: 'activity_type', operator: 'EQUALS', value: filters.activityType });
  if (filters.active !== undefined) apiFilters.push({ field: 'active', operator: 'EQUALS', value: String(filters.active) });
  // dueOnDay is a plain 'YYYY-MM-DD' day; bracket it as [start-of-day, end-of-day] range filters
  // directly on next_due_at (the API's generic Criteria mechanism supports >=/<= on any real
  // column), so only schedules due on that exact day are returned — not earlier ones too.
  if (filters.dueOnDay) {
    apiFilters.push({ field: 'next_due_at', operator: 'GREATER_THAN_OR_EQUAL', value: `${filters.dueOnDay}T00:00:00.000` });
    apiFilters.push({ field: 'next_due_at', operator: 'LESS_THAN_OR_EQUAL', value: `${filters.dueOnDay}T23:59:59.999` });
  }

  return apiFilters.length ? { filters: apiFilters } : undefined;
}

export class CareScheduleGqlRepository implements ICareScheduleRepository {
  async findByCriteria(filters?: CareScheduleFilters): Promise<CareSchedule[]> {
    const res = await apolloClient.query<CareSchedulesFindByCriteriaResponse>({
      query: CARE_SCHEDULES_FIND_BY_CRITERIA,
      variables: { input: toApiFilters(filters) },
      fetchPolicy: 'network-only',
    });
    return res.data?.careSchedulesFindByCriteria?.items ?? [];
  }

  async findById(id: string): Promise<CareSchedule> {
    const res = await apolloClient.query<CareScheduleFindByIdResponse>({
      query: CARE_SCHEDULE_FIND_BY_ID,
      variables: { input: { id } },
      fetchPolicy: 'network-only',
    });
    if (!res.data?.careScheduleFindById) throw new Error(`Care schedule not found: ${id}`);
    return res.data.careScheduleFindById;
  }

  async create(input: CreateCareScheduleInput): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<CareScheduleCreateResponse>({
      mutation: CARE_SCHEDULE_CREATE,
      variables: { input },
    });
    if (!res.data?.careScheduleCreate?.success) throw new Error('careScheduleCreate mutation failed');
    return { id: res.data.careScheduleCreate.id };
  }

  async update(input: UpdateCareScheduleInput): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<CareScheduleUpdateResponse>({
      mutation: CARE_SCHEDULE_UPDATE,
      variables: { input },
    });
    if (!res.data?.careScheduleUpdate?.success) throw new Error('careScheduleUpdate mutation failed');
    return { id: res.data.careScheduleUpdate.id };
  }

  async complete(id: string, completedAt?: string): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<CareScheduleCompleteResponse>({
      mutation: CARE_SCHEDULE_COMPLETE,
      variables: { input: { id, completedAt } },
    });
    if (!res.data?.careScheduleComplete?.success) throw new Error('careScheduleComplete mutation failed');
    return { id: res.data.careScheduleComplete.id };
  }

  async delete(id: string): Promise<void> {
    await apolloClient.mutate<CareScheduleDeleteResponse>({
      mutation: CARE_SCHEDULE_DELETE,
      variables: { id },
    });
  }

  async waterPlant(plantId: string, performedAt?: string): Promise<WaterPlantResult> {
    const res = await apolloClient.mutate<CareScheduleWaterPlantResponse>({
      mutation: CARE_SCHEDULE_WATER_PLANT,
      variables: { input: { plantId, performedAt } },
    });
    if (!res.data?.careScheduleWaterPlant) throw new Error('careScheduleWaterPlant mutation failed');
    return res.data.careScheduleWaterPlant;
  }
}

export const careScheduleGqlRepository = new CareScheduleGqlRepository();
