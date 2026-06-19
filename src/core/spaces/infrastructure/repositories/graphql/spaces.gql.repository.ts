import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import type { ISpacesRepository } from '@/core/spaces/application/ports/spaces.repository.port';
import type { CreateInvitationInput } from '@/core/spaces/application/interfaces/create-invitation-input.interface';
import type { MemberInput } from '@/core/spaces/application/interfaces/member-input.interface';
import type { UpdateSpaceInput } from '@/core/spaces/application/interfaces/update-space-input.interface';
import type { Space } from '@/core/spaces/domain/interfaces/space.interface';
import type { SpaceDetail } from '@/core/spaces/domain/interfaces/space-detail.interface';
import type { SpaceInvitation } from '@/core/spaces/domain/types/space-invitation.type';
import type { SpaceWeather } from '@/core/spaces/domain/interfaces/space-weather.interface';
import { SPACES_FIND_BY_USER } from './queries/spaces-find-by-user.query';
import { SPACE_FIND_BY_ID } from './queries/space-find-by-id.query';
import { SPACE_ACCEPT_INVITATION } from './mutations/space-accept-invitation.mutation';
import { SPACE_CREATE } from './mutations/space-create.mutation';
import { SPACE_CREATE_INVITATION } from './mutations/space-create-invitation.mutation';
import { SPACE_ADD_MEMBER } from './mutations/space-add-member.mutation';
import { SPACE_REMOVE_MEMBER } from './mutations/space-remove-member.mutation';
import { SPACE_UPDATE } from './mutations/space-update-geolocation.mutation';

interface SpacesFindByUserData {
  spacesFindByUser: { items: Space[] };
}

interface SpaceFindByIdData {
  spaceFindById: SpaceDetail;
}

interface SpaceCreateData {
  spaceCreate: { id: string; success: boolean; message: string };
}

interface SpaceAcceptInvitationData {
  spaceAcceptInvitation: { id: string; success: boolean; message: string };
}

interface SpaceCreateInvitationData {
  spaceCreateInvitation: SpaceInvitation;
}

interface SpaceMemberMutationData {
  spaceAddMember?: { id: string; success: boolean; message: string };
  spaceRemoveMember?: { id: string; success: boolean; message: string };
}

interface SpaceUpdateData {
  spaceUpdate: { id: string; success: boolean; message: string };
}

export class SpacesGqlRepository implements ISpacesRepository {
  async listByUser(): Promise<Space[]> {
    const res = await apolloClient.query<SpacesFindByUserData>({
      query: SPACES_FIND_BY_USER,
      fetchPolicy: 'network-only',
    });
    return res.data?.spacesFindByUser?.items ?? [];
  }

  async findById(spaceId: string): Promise<SpaceDetail> {
    const res = await apolloClient.query<SpaceFindByIdData>({
      query: SPACE_FIND_BY_ID,
      variables: { input: { id: spaceId } },
      fetchPolicy: 'network-only',
    });
    if (!res.data?.spaceFindById) {
      throw new Error(`Space not found: ${spaceId}`);
    }
    return res.data.spaceFindById;
  }

  async acceptInvitation(code: string): Promise<string> {
    const res = await apolloClient.mutate<SpaceAcceptInvitationData>({
      mutation: SPACE_ACCEPT_INVITATION,
      variables: { input: { code } },
    });
    if (!res.data?.spaceAcceptInvitation?.success) {
      throw new Error(
        res.data?.spaceAcceptInvitation?.message ?? 'spaceAcceptInvitation mutation failed',
      );
    }
    const spaceId = res.data.spaceAcceptInvitation.id;
    if (!spaceId) {
      throw new Error('spaceAcceptInvitation mutation did not return a space id');
    }
    return spaceId;
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

  async createInvitation(input: CreateInvitationInput): Promise<SpaceInvitation> {
    const res = await apolloClient.mutate<SpaceCreateInvitationData>({
      mutation: SPACE_CREATE_INVITATION,
      variables: {
        input: {
          spaceId: input.spaceId,
          role: input.role?.toUpperCase(),
          expiresAt: input.expiresAt,
        },
      },
    });
    if (!res.data?.spaceCreateInvitation) {
      throw new Error('spaceCreateInvitation mutation failed');
    }
    return res.data.spaceCreateInvitation;
  }

  async addMember(input: MemberInput): Promise<void> {
    const res = await apolloClient.mutate<SpaceMemberMutationData>({
      mutation: SPACE_ADD_MEMBER,
      variables: { input: { spaceId: input.spaceId, targetUserId: input.targetUserId } },
    });
    if (!res.data?.spaceAddMember?.success) {
      throw new Error(res.data?.spaceAddMember?.message ?? 'spaceAddMember mutation failed');
    }
  }

  async removeMember(input: MemberInput): Promise<void> {
    const res = await apolloClient.mutate<SpaceMemberMutationData>({
      mutation: SPACE_REMOVE_MEMBER,
      variables: { input: { spaceId: input.spaceId, targetUserId: input.targetUserId } },
    });
    if (!res.data?.spaceRemoveMember?.success) {
      throw new Error(res.data?.spaceRemoveMember?.message ?? 'spaceRemoveMember mutation failed');
    }
  }

  async getSpaceWeather(spaceId: string): Promise<SpaceWeather | null> {
    const res = await apolloClient.query<SpaceFindByIdData>({
      query: SPACE_FIND_BY_ID,
      variables: { input: { id: spaceId } },
      fetchPolicy: 'network-only',
    });
    return res.data?.spaceFindById?.weather ?? null;
  }

  async update(input: UpdateSpaceInput): Promise<void> {
    const res = await apolloClient.mutate<SpaceUpdateData>({
      mutation: SPACE_UPDATE,
      variables: { input },
    });
    if (!res.data?.spaceUpdate?.success) {
      throw new Error(
        res.data?.spaceUpdate?.message ?? 'spaceUpdate mutation failed',
      );
    }
  }
}

export const spacesGqlRepository = new SpacesGqlRepository();
