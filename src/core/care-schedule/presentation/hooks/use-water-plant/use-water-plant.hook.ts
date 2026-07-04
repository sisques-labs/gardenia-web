import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WaterPlantUseCase } from '@/core/care-schedule/application/use-cases/water-plant/water-plant.use-case';
import { careScheduleGqlRepository } from '@/core/care-schedule/infrastructure/repositories/graphql/care-schedule.gql.repository';

const waterPlantUseCase = new WaterPlantUseCase(careScheduleGqlRepository);

export function useWaterPlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, performedAt }: { plantId: string; performedAt?: string }) =>
      waterPlantUseCase.execute(plantId, performedAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['care-log'] });
    },
  });
}
