import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateCareScheduleUseCase } from '@/core/care-schedule/application/use-cases/update-care-schedule/update-care-schedule.use-case';
import { careScheduleGqlRepository } from '@/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository';
import type { UpdateCareScheduleInput } from '@/core/care-schedule/application/interfaces/update-care-schedule-input.interface';

const updateCareScheduleUseCase = new UpdateCareScheduleUseCase(careScheduleGqlRepository);

export function useUpdateCareSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCareScheduleInput) => updateCareScheduleUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-schedules'] });
    },
  });
}
