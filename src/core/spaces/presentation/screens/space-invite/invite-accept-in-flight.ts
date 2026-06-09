import { CombinedGraphQLErrors } from '@apollo/client/errors';

const inFlightCodes = new Set<string>();
const COMPLETED_PREFIX = 'gardenia:invite-accept:';

export function claimInviteAccept(code: string): boolean {
  if (inFlightCodes.has(code)) return false;
  inFlightCodes.add(code);
  return true;
}

export function releaseInviteAccept(code: string): void {
  inFlightCodes.delete(code);
}

export function wasInviteAcceptCompleted(code: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(`${COMPLETED_PREFIX}${code}`) === '1';
}

export function markInviteAcceptCompleted(code: string): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(`${COMPLETED_PREFIX}${code}`, '1');
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
