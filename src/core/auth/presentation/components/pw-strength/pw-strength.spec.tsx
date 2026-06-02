import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PwStrength } from './pw-strength';

describe('PwStrength', () => {
  it('shows 2 filled segments for a weak password (score=2)', () => {
    // "abcdef" → getPwStrength = 2 (len>=6, no digit, no special)
    render(<PwStrength password="abcdef" />);
    const filled = screen.getAllByTestId('pw-segment-filled');
    expect(filled).toHaveLength(2);
  });

  it('shows 0 filled segments for empty password (score=0)', () => {
    render(<PwStrength password="" />);
    expect(screen.queryAllByTestId('pw-segment-filled')).toHaveLength(0);
    const unfilled = screen.getAllByTestId('pw-segment-empty');
    expect(unfilled).toHaveLength(4);
  });

  it('shows 4 filled segments for strong password (score=4)', () => {
    render(<PwStrength password="abcdef1!" />);
    const filled = screen.getAllByTestId('pw-segment-filled');
    expect(filled).toHaveLength(4);
  });
});
