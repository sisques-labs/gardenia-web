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
