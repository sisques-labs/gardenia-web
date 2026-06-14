import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RemoveSpaceMemberUseCase } from '@/core/spaces/application/use-cases/remove-space-member/remove-space-member.use-case';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';
import type { MemberInput } from '@/core/spaces/application/interfaces/member-input.interface';

const removeSpaceMemberUseCase = new RemoveSpaceMemberUseCase(spacesGqlRepository);

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MemberInput) => removeSpaceMemberUseCase.execute(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['space-detail', variables.spaceId] });
    },
  });
}
