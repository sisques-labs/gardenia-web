import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

export interface CareSchedulesFindByCriteriaResponse {
  careSchedulesFindByCriteria: { items: CareSchedule[] };
}
