import { CombinedGraphQLErrors } from '@apollo/client/errors';

export type InviteErrorCode =
  | 'InvitationNotFoundException'
  | 'InvitationExpiredException'
  | 'DuplicateMembershipException';

export function getInvitationErrorCode(error: unknown): InviteErrorCode | null {
  if (!CombinedGraphQLErrors.is(error)) return null;

  const code = error.errors[0]?.extensions?.code;
  return typeof code === 'string' ? (code as InviteErrorCode) : null;
}
