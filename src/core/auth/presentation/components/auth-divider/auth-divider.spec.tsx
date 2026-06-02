import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthDivider } from './auth-divider';

describe('AuthDivider', () => {
  it('renders label text', () => {
    render(<AuthDivider label="or" />);
    expect(screen.getByText('or')).toBeDefined();
  });
});
