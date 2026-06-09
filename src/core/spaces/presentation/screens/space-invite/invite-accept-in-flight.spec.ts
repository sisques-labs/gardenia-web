import { describe, expect, it, beforeEach } from 'vitest';
import {
  claimInviteAccept,
  isAlreadyMemberError,
  markInviteAcceptCompleted,
  releaseInviteAccept,
  wasInviteAcceptCompleted,
} from './invite-accept-in-flight';

describe('invite-accept-in-flight', () => {
  beforeEach(() => {
    releaseInviteAccept('CODE-A');
    releaseInviteAccept('CODE-B');
  });

  it('allows only one in-flight accept per code', () => {
    expect(claimInviteAccept('CODE-A')).toBe(true);
    expect(claimInviteAccept('CODE-A')).toBe(false);
    releaseInviteAccept('CODE-A');
    expect(claimInviteAccept('CODE-A')).toBe(true);
  });

  it('tracks completed accepts in sessionStorage', () => {
    expect(wasInviteAcceptCompleted('CODE-A')).toBe(false);
    markInviteAcceptCompleted('CODE-A');
    expect(wasInviteAcceptCompleted('CODE-A')).toBe(true);
  });

  it('detects already-member error messages', () => {
    const error = new Error("User 'u1' is already a member of space 's1'");
    expect(isAlreadyMemberError(error)).toBe(true);
  });
});
