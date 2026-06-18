import { useMutation } from '@tanstack/react-query';
import { updateSpaceGeolocationUseCase } from '@/core/spaces/application/use-cases/update-space-geolocation/update-space-geolocation.use-case';
import type { UpdateGeolocationInput } from '@/core/spaces/application/interfaces/update-geolocation-input.interface';

export function useUpdateGeolocation() {
  return useMutation({
    mutationFn: (input: UpdateGeolocationInput) => updateSpaceGeolocationUseCase.execute(input),
  });
}
