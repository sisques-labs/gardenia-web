const dict = {
  login: {
    title: 'Sign in',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Min. 6 characters',
    submit: 'Sign in',
    submitting: 'Signing in...',
    invalidCredentials: 'Invalid email or password',
    emailInvalid: 'Invalid email',
    passwordMin: 'At least 6 characters',
  },
  register: {
    title: 'Create account',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Min. 6 characters',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Repeat your password',
    submit: 'Create account',
    submitting: 'Creating account...',
    error: 'Could not create account. Try again.',
    emailInvalid: 'Invalid email',
    passwordMin: 'At least 6 characters',
    passwordsMismatch: 'Passwords do not match',
  },
} as const;

export default dict;
export type AuthDict = typeof dict;
