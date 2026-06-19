import { useMutation } from '@tanstack/react-query';
import { updateSpaceGeolocationUseCase } from '@/core/spaces/application/use-cases/update-space-geolocation/update-space-geolocation.use-case';
import type { UpdateSpaceInput } from '@/core/spaces/application/interfaces/update-space-input.interface';

export function useUpdateSpace() {
  return useMutation({
    mutationFn: (input: UpdateSpaceInput) => updateSpaceGeolocationUseCase.execute(input),
  });
}
