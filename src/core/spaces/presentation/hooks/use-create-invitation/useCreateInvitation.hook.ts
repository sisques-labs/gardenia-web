import { useMutation } from '@tanstack/react-query';
import { CreateSpaceInvitationUseCase } from '@/core/spaces/application/use-cases/create-space-invitation/create-space-invitation.use-case';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';
import type { CreateInvitationInput } from '@/core/spaces/application/ports/spaces.repository.port';

const createSpaceInvitationUseCase = new CreateSpaceInvitationUseCase(spacesGqlRepository);

export function useCreateInvitation() {
  return useMutation({
    mutationFn: (input: CreateInvitationInput) => createSpaceInvitationUseCase.execute(input),
  });
}
