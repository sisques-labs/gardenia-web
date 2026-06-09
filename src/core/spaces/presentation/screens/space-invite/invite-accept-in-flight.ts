import { CombinedGraphQLErrors } from '@apollo/client/errors';

const inFlightCodes = new Set<string>();

export function claimInviteAccept(code: string): boolean {
  if (inFlightCodes.has(code)) return false;
  inFlightCodes.add(code);
  return true;
}

export function releaseInviteAccept(code: string): void {
  inFlightCodes.delete(code);
}

function messageIndicatesAlreadyMember(message: string): boolean {
  return message.includes('already a member');
}

export function isAlreadyMemberError(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some((entry) => messageIndicatesAlreadyMember(entry.message));
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message: unknown }).message)
        : '';

  return messageIndicatesAlreadyMember(message);
}
