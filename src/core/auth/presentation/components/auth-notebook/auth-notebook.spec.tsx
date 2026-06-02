import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AuthNotebook } from './auth-notebook';

describe('AuthNotebook', () => {
  it('renders an SVG with aria-hidden="true"', () => {
    const { container } = render(<AuthNotebook />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
