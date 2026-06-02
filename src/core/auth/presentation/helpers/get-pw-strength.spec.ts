import { describe, it, expect } from 'vitest';
import { getPwStrength } from './get-pw-strength';

describe('getPwStrength', () => {
  it('returns 0 for empty string', () => {
    expect(getPwStrength('')).toBe(0);
  });

  it('returns 1 for very weak passwords (< 6 chars)', () => {
    expect(getPwStrength('abc')).toBe(1);
  });

  it('returns 2 for weak passwords (6+ chars, lowercase only)', () => {
    expect(getPwStrength('abcdef')).toBe(2);
  });

  it('returns 3 for medium passwords (letters + digits)', () => {
    expect(getPwStrength('abcdef1')).toBe(3);
  });

  it('returns 4 for strong passwords (letters + digits + special)', () => {
    expect(getPwStrength('abcdef1!')).toBe(4);
  });

  it('returns 4 for long complex password', () => {
    expect(getPwStrength('My$ecureP4ss!')).toBe(4);
  });

  it('returns 0 for undefined-like empty', () => {
    expect(getPwStrength('')).toBe(0);
  });
});
