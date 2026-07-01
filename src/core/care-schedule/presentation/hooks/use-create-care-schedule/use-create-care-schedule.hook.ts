import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCareScheduleUseCase } from '@/core/care-schedule/application/use-cases/create-care-schedule/create-care-schedule.use-case';
import { careScheduleGqlRepository } from '@/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository';
import type { CreateCareScheduleInput } from '@/core/care-schedule/application/interfaces/create-care-schedule-input.interface';

const createCareScheduleUseCase = new CreateCareScheduleUseCase(careScheduleGqlRepository);

export function useCreateCareSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCareScheduleInput) => createCareScheduleUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-schedules'] });
    },
  });
}
