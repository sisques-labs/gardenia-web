import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthHead } from './auth-head';

describe('AuthHead', () => {
  it('renders all three text elements', () => {
    render(<AuthHead eyebrow="Eyebrow" title="Title" sub="Subtitle" />);
    expect(screen.getByText('Eyebrow')).toBeDefined();
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('Subtitle')).toBeDefined();
  });

  it('renders with only title — eyebrow and sub not in DOM', () => {
    render(<AuthHead title="Title only" />);
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.queryByText('Eyebrow')).toBeNull();
    expect(screen.queryByText('Subtitle')).toBeNull();
  });
});
