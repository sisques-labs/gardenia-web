import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AcceptSpaceInvitationUseCase } from '@/core/spaces/application/use-cases/accept-space-invitation/accept-space-invitation.use-case';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';

const acceptSpaceInvitationUseCase = new AcceptSpaceInvitationUseCase(spacesGqlRepository);

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => acceptSpaceInvitationUseCase.execute(code),
    onSuccess: (joinedSpace) => {
      queryClient.setQueryData<Space[]>(['spaces'], (current = []) => {
        if (!joinedSpace) return current;
        return current.some((space) => space.id === joinedSpace.id)
          ? current
          : [...current, joinedSpace];
      });
      void queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}
