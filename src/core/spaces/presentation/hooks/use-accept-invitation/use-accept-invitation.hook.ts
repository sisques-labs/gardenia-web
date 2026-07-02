import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AcceptSpaceInvitationUseCase } from '@/core/spaces/application/use-cases/accept-space-invitation/accept-space-invitation.use-case';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';

const acceptSpaceInvitationUseCase = new AcceptSpaceInvitationUseCase(spacesGqlRepository);

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => acceptSpaceInvitationUseCase.execute(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['spaces'] });
    },
  });
}
