import { useQuery } from '@tanstack/react-query';
import { GetCareSchedulesUseCase } from '@/core/care-schedule/application/use-cases/get-care-schedules/get-care-schedules.use-case';
import { careScheduleGqlRepository } from '@/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { CareScheduleFilters } from '@/core/care-schedule/application/interfaces/care-schedule-filters.interface';

const getCareSchedulesUseCase = new GetCareSchedulesUseCase(careScheduleGqlRepository);

export function useCareSchedules(filters: CareScheduleFilters = {}) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['care-schedules', spaceId, filters],
    queryFn: () => getCareSchedulesUseCase.execute(filters),
    enabled: !!spaceId,
  });

  return { careSchedules: data ?? [], isLoading, error };
}
