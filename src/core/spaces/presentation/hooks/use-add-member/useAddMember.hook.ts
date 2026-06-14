import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddSpaceMemberUseCase } from '@/core/spaces/application/use-cases/add-space-member/add-space-member.use-case';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';
import type { MemberInput } from '@/core/spaces/application/interfaces/member-input.interface';

const addSpaceMemberUseCase = new AddSpaceMemberUseCase(spacesGqlRepository);

export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MemberInput) => addSpaceMemberUseCase.execute(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['space-detail', variables.spaceId] });
    },
  });
}
