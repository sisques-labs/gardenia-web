import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLegal } from './auth-legal';

describe('AuthLegal', () => {
  it('renders children text', () => {
    render(<AuthLegal>By continuing you agree to our Terms</AuthLegal>);
    expect(screen.getByText('By continuing you agree to our Terms')).toBeDefined();
  });
});
