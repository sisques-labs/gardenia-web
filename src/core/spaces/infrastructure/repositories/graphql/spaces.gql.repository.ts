import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import { SPACES_FIND_BY_USER } from './queries/spaces-find-by-user.query';
import { SPACE_ACCEPT_INVITATION } from './mutations/space-accept-invitation.mutation';
import { SPACE_CREATE } from './mutations/space-create.mutation';

interface SpacesFindByUserData {
  spacesFindByUser: { items: Space[] };
}

interface SpaceCreateData {
  spaceCreate: { id: string; success: boolean; message: string };
}

interface SpaceAcceptInvitationData {
  spaceAcceptInvitation: { id: string; success: boolean; message: string };
}

export class SpacesGqlRepository implements ISpacesRepository {
  async listByUser(): Promise<Space[]> {
    const res = await apolloClient.query<SpacesFindByUserData>({ query: SPACES_FIND_BY_USER });
    return res.data?.spacesFindByUser?.items ?? [];
  }

  async acceptInvitation(code: string): Promise<void> {
    const res = await apolloClient.mutate<SpaceAcceptInvitationData>({
      mutation: SPACE_ACCEPT_INVITATION,
      variables: { input: { code } },
    });
    if (!res.data?.spaceAcceptInvitation?.success) {
      throw new Error(
        res.data?.spaceAcceptInvitation?.message ?? 'spaceAcceptInvitation mutation failed',
      );
    }
  }

  async create(name: string): Promise<Space> {
    const res = await apolloClient.mutate<SpaceCreateData>({
      mutation: SPACE_CREATE,
      variables: { input: { name } },
    });
    if (!res.data?.spaceCreate?.success) throw new Error('spaceCreate mutation failed');
    const ownerId = useAuthStore.getState().currentUser?.userId ?? '';
    return {
      id: res.data.spaceCreate.id,
      name,
      ownerId,
      createdAt: new Date().toISOString(),
    };
  }
}

export const spacesGqlRepository = new SpacesGqlRepository();
