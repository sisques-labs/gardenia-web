import { describe, it, expect } from 'vitest';
import { trimOptional } from './trim-optional';

describe('trimOptional', () => {
  it('trims surrounding whitespace', () => {
    expect(trimOptional('  hello  ')).toBe('hello');
  });

  it('returns undefined for undefined input', () => {
    expect(trimOptional(undefined)).toBeUndefined();
  });

  it('returns undefined for empty or whitespace-only strings', () => {
    expect(trimOptional('')).toBeUndefined();
    expect(trimOptional('   ')).toBeUndefined();
  });
});
