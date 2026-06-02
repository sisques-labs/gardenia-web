import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthField } from './auth-field';

const fakeRegistration = {
  name: 'email' as const,
  ref: () => {},
  onChange: async () => {},
  onBlur: async () => {},
};

describe('AuthField', () => {
  it('renders label', () => {
    render(<AuthField id="email" label="Email" registration={fakeRegistration} />);
    expect(screen.getByText('Email')).toBeDefined();
  });

  it('renders error message when error prop is provided', () => {
    render(
      <AuthField id="email" label="Email" error="Invalid email" registration={fakeRegistration} />
    );
    expect(screen.getByText('Invalid email')).toBeDefined();
  });

  it('does not render error message when no error prop', () => {
    render(<AuthField id="email" label="Email" registration={fakeRegistration} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('toggles password visibility when toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthField id="pw" label="Password" type="password" registration={fakeRegistration} />
    );
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
    await user.click(screen.getByRole('button'));
    expect(input.type).toBe('text');
  });

  it('does not render toggle button for non-password fields', () => {
    render(<AuthField id="email" label="Email" type="email" registration={fakeRegistration} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
