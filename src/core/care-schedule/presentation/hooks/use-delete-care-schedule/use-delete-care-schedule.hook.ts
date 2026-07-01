import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteCareScheduleUseCase } from '@/core/care-schedule/application/use-cases/delete-care-schedule/delete-care-schedule.use-case';
import { careScheduleGqlRepository } from '@/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository';

const deleteCareScheduleUseCase = new DeleteCareScheduleUseCase(careScheduleGqlRepository);

export function useDeleteCareSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCareScheduleUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-schedules'] });
    },
  });
}
