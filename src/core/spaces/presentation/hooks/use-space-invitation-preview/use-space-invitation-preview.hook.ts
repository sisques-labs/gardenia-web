import { useQuery } from '@tanstack/react-query';
import { GetSpaceInvitationPreviewUseCase } from '@/core/spaces/application/use-cases/get-space-invitation-preview/get-space-invitation-preview.use-case';
import { spacesGqlRepository } from '@/core/spaces/infrastructure/repositories/graphql/spaces.gql.repository';

const getSpaceInvitationPreviewUseCase = new GetSpaceInvitationPreviewUseCase(spacesGqlRepository);

export function useSpaceInvitationPreview(code: string) {
  return useQuery({
    queryKey: ['space-invitation-preview', code],
    queryFn: () => getSpaceInvitationPreviewUseCase.execute(code),
    enabled: !!code,
    retry: false,
  });
}
