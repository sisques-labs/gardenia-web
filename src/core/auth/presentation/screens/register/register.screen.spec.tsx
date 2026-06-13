import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockMutate = vi.hoisted(() => vi.fn());
const mockIsPending = vi.hoisted(() => ({ value: false }));
const mockError = vi.hoisted(() => ({ value: null as Error | null }));

vi.mock('@/core/auth/presentation/hooks/use-register/useRegister.hook', () => ({
  useRegister: () => ({
    mutate: mockMutate,
    isPending: mockIsPending.value,
    error: mockError.value,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import { RegisterScreen } from './register.screen';

const dict = {
  title: 'Create account',
  eyebrow: '✦ Start for free',
  email: 'Email',
  emailPlaceholder: 'you@example.com',
  password: 'Password',
  passwordPlaceholder: 'Min. 6 characters',
  passwordHint: 'Minimum 8 characters.',
  confirmPassword: 'Confirm password',
  confirmPasswordPlaceholder: 'Repeat your password',
  submit: 'Create account',
  submitting: 'Creating account...',
  error: 'Could not create account. Try again.',
  emailInvalid: 'Invalid email',
  passwordMin: 'At least 6 characters',
  passwordsMismatch: 'Passwords do not match',
  showPassword: 'Show',
  hidePassword: 'Hide',
  login: 'Already have an account? Sign in',
  terms: 'By continuing, you agree to our Terms of Service.',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
}

describe('RegisterScreen', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockIsPending.value = false;
    mockError.value = null;
  });

  it('renders password hint always visible', () => {
    render(<RegisterScreen dict={dict} />, { wrapper: createWrapper() });
    expect(screen.getByText(dict.passwordHint)).toBeDefined();
  });

  it('PwStrength updates as user types in password field', async () => {
    const user = userEvent.setup();
    render(<RegisterScreen dict={dict} />, { wrapper: createWrapper() });

    const passwordInputs = screen.getAllByLabelText(dict.password);
    // Only first password field (not confirm)
    const pwInput = passwordInputs[0];

    // Initially empty — no filled segments
    expect(screen.queryAllByTestId('pw-segment-filled')).toHaveLength(0);

    // Type a strong password
    await user.type(pwInput, 'abcdef1!');

    // Should have 4 filled segments
    expect(screen.getAllByTestId('pw-segment-filled')).toHaveLength(4);
  });
});
