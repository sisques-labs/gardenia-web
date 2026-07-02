import { useQuery } from '@tanstack/react-query';
import { GetSpaceMembersUseCase } from '@/core/users/application/use-cases/get-space-members/get-space-members.use-case';
import { usersGqlRepository } from '@/core/users/infrastructure/repositories/graphql/users.gql.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

export function useSpaceMembers() {
  const currentSpaceId = useSpacesStore((s) => s.currentSpaceId);
  return useQuery({
    queryKey: ['space-members', currentSpaceId],
    queryFn: () => new GetSpaceMembersUseCase(usersGqlRepository).execute(),
    enabled: !!currentSpaceId,
  });
}
