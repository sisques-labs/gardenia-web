import { describe, expect, it } from 'vitest';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { getInvitationErrorCode } from './invite-error-code';

function buildGraphQLError(code: string) {
  return new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'boom', extensions: { code } }],
  });
}

describe('getInvitationErrorCode', () => {
  it('reads extensions.code from a CombinedGraphQLErrors', () => {
    const error = buildGraphQLError('InvitationExpiredException');
    expect(getInvitationErrorCode(error)).toBe('InvitationExpiredException');
  });

  it('returns null when extensions.code is missing', () => {
    const error = new CombinedGraphQLErrors({
      data: null,
      errors: [{ message: 'boom' }],
    });
    expect(getInvitationErrorCode(error)).toBeNull();
  });

  it('returns null for a plain Error', () => {
    expect(getInvitationErrorCode(new Error('network error'))).toBeNull();
  });

  it('returns null for a non-error value', () => {
    expect(getInvitationErrorCode(undefined)).toBeNull();
  });
});
