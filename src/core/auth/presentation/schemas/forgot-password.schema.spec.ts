import { describe, it, expect } from 'vitest';
import { forgotPasswordSchema } from './forgot-password.schema';

describe('forgotPasswordSchema', () => {
  it('passes with a valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('fails when email is empty', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('email');
  });

  it('fails when email is malformed', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('email');
  });
});
