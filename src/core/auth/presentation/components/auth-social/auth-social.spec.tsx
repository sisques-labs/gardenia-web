import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthSocial } from './auth-social';

describe('AuthSocial', () => {
  it('renders 3 social buttons', () => {
    render(<AuthSocial />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('all buttons are disabled', () => {
    render(<AuthSocial />);
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
    buttons.forEach((btn) => expect(btn.disabled).toBe(true));
  });

  it('renders inline SVG elements for Apple and Google (no <img> tags)', () => {
    const { container } = render(<AuthSocial />);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(0);
    // SVGs are inline
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });
});
