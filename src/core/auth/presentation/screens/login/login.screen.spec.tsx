import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockReplace = vi.hoisted(() => vi.fn());
const mockMutate = vi.hoisted(() => vi.fn());
const mockIsPending = vi.hoisted(() => ({ value: false }));
const mockError = vi.hoisted(() => ({ value: null as Error | null }));
let mockReturnUrl: string | null = null;
let mockErrorParam: string | null = null;

vi.mock('@/core/auth/presentation/hooks/use-login/useLogin.hook', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: mockIsPending.value,
    error: mockError.value,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'returnUrl') return mockReturnUrl;
      if (key === 'error') return mockErrorParam;
      return null;
    },
  }),
}));

import { LoginScreen } from './login.screen';

const dict = {
  title: 'Sign in',
  eyebrow: '✦ Bienvenida de vuelta',
  email: 'Email',
  emailPlaceholder: 'you@example.com',
  password: 'Password',
  passwordPlaceholder: 'Min. 6 characters',
  submit: 'Sign in',
  submitting: 'Signing in...',
  invalidCredentials: 'Invalid email or password',
  keepSession: 'Keep me signed in on this device',
  emailInvalid: 'Invalid email',
  passwordMin: 'At least 6 characters',
  showPassword: 'Show',
  hidePassword: 'Hide',
  forgotPassword: 'Forgot your password?',
  register: "Don't have an account?",
  oauthFailed: "We couldn't sign you in with that provider. Please use email/password or try another provider.",
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

describe('LoginScreen', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockReplace.mockReset();
    mockIsPending.value = false;
    mockError.value = null;
    mockReturnUrl = null;
    mockErrorParam = null;
  });

  it('renders without error banner when no error', () => {
    render(<LoginScreen dict={dict} locale="es" />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(dict.email)).toBeDefined();
    expect(screen.getByLabelText(dict.password)).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders error banner after failed login', () => {
    mockError.value = new Error('Invalid credentials');

    render(<LoginScreen dict={dict} locale="es" />, { wrapper: createWrapper() });

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(dict.invalidCredentials)).toBeDefined();
  });

  it('renders forgot-password link', () => {
    render(<LoginScreen dict={dict} locale="es" />, { wrapper: createWrapper() });

    const forgotLink = screen.getByText(dict.forgotPassword);
    expect(forgotLink.closest('a')?.getAttribute('href')).toContain('forgot-password');
  });

  it('redirects to /${locale}/home when no returnUrl is present', async () => {
    mockReturnUrl = null;

    mockMutate.mockImplementation((_data: unknown, { onSuccess }: { onSuccess: () => void }) => {
      onSuccess();
    });

    render(<LoginScreen dict={dict} locale="es" />, { wrapper: createWrapper() });

    fireEvent.change(screen.getByLabelText(dict.email), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(dict.password), { target: { value: 'password123' } });

    const form = screen.getByRole('button', { name: dict.submit }).closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/es/home');
    });
  });

  it('renders oauthFailed banner when ?error=oauth_failed is present', () => {
    mockErrorParam = 'oauth_failed';

    render(<LoginScreen dict={dict} locale="es" />, { wrapper: createWrapper() });

    const alert = screen.getByRole('alert');
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain(dict.oauthFailed);
  });

  it('does not render oauthFailed banner when ?error is absent', () => {
    mockErrorParam = null;

    render(<LoginScreen dict={dict} locale="es" />, { wrapper: createWrapper() });

    // The only alert that may appear is the login error — and there is none here
    const alerts = screen.queryAllByRole('alert');
    expect(alerts).toHaveLength(0);
  });

  it('does not render oauthFailed banner when ?error has a different value', () => {
    mockErrorParam = 'some_other_error';

    render(<LoginScreen dict={dict} locale="es" />, { wrapper: createWrapper() });

    const alerts = screen.queryAllByRole('alert');
    expect(alerts).toHaveLength(0);
  });

  it('keep-session control is a real checkbox associated with its label', () => {
    render(<LoginScreen dict={dict} locale="es" />, { wrapper: createWrapper() });

    const checkbox = screen.getByLabelText(dict.keepSession);
    expect(checkbox).toHaveAttribute('type', 'checkbox');
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
