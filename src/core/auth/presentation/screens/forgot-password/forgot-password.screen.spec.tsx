import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockMutate = vi.hoisted(() => vi.fn());
const mockIsPending = vi.hoisted(() => ({ value: false }));
const mockIsSuccess = vi.hoisted(() => ({ value: false }));
const mockError = vi.hoisted(() => ({ value: null as Error | null }));

vi.mock('@/core/auth/presentation/hooks/use-forgot-password/useForgotPassword.hook', () => ({
  useForgotPassword: () => ({
    mutate: mockMutate,
    isPending: mockIsPending.value,
    isSuccess: mockIsSuccess.value,
    error: mockError.value,
  }),
}));

import { ForgotPasswordScreen } from './forgot-password.screen';

const dict = {
  eyebrow: 'Password reset',
  title: 'Forgot your password?',
  sub: 'Enter your email and we will send you a reset link.',
  email: 'Email',
  emailPlaceholder: 'you@example.com',
  submit: 'Send reset link',
  submitting: 'Sending...',
  successTitle: 'Check your inbox',
  successBody: 'If an account exists, you will receive a reset link.',
  backToLogin: 'Back to sign in',
  emailInvalid: 'Invalid email',
  socialHint: 'Did you sign up with Google or Apple?',
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

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockIsPending.value = false;
    mockIsSuccess.value = false;
    mockError.value = null;
  });

  it('renders initial state with all required elements', () => {
    render(<ForgotPasswordScreen dict={dict} />, { wrapper: createWrapper() });

    expect(screen.getByText(dict.eyebrow)).toBeDefined();
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByLabelText(dict.email)).toBeDefined();
    expect(screen.getByRole('button', { name: dict.submit })).toBeDefined();
    expect(screen.getByText(dict.socialHint)).toBeDefined();
    expect(screen.getByText(dict.backToLogin)).toBeDefined();
  });

  it('shows success state and hides form after successful submission', () => {
    mockIsSuccess.value = true;

    render(<ForgotPasswordScreen dict={dict} />, { wrapper: createWrapper() });

    expect(screen.getByText(dict.successTitle)).toBeDefined();
    expect(screen.getByText(dict.successBody)).toBeDefined();
    // Form fields should not be rendered
    expect(screen.queryByLabelText(dict.email)).toBeNull();
    expect(screen.queryByRole('button', { name: dict.submit })).toBeNull();
  });

  it('back link points to login route', () => {
    render(<ForgotPasswordScreen dict={dict} />, { wrapper: createWrapper() });

    const backLink = screen.getByText(dict.backToLogin);
    expect(backLink.closest('a')?.getAttribute('href')).toContain('login');
  });
});
