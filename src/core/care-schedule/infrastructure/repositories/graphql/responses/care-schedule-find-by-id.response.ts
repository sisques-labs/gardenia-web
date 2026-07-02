import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

export interface CareScheduleFindByIdResponse {
  careScheduleFindById: CareSchedule | null;
}
