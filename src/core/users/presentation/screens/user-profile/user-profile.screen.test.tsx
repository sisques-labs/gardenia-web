import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { User } from '@/core/users/domain/interfaces/user.interface';

const mockAuthSelector = vi.fn();
const mockUseUser = vi.fn();

vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: (selector: (s: {
    isBootComplete: boolean;
    currentUser: { id: string; email: string } | null;
  }) => unknown) => mockAuthSelector(selector),
}));

vi.mock('@/core/users/presentation/hooks/use-user/use-user.hook', () => ({
  useUser: (...args: unknown[]) => mockUseUser(...args),
}));

vi.mock('@/core/users/presentation/hooks/use-user-initials/use-user-initials.hook', () => ({
  useUserInitials: () => 'JD',
}));

vi.mock('@/core/users/presentation/hooks/use-update-user-profile-form/use-update-user-profile-form.hook', () => ({
  useUpdateUserProfileForm: () => ({
    form: {
      register: vi.fn(),
      formState: { errors: {} },
    },
    onSubmit: vi.fn(),
    isPending: false,
    error: null,
    isSuccess: false,
  }),
}));

import { UserProfileScreen } from './user-profile.screen';

const mockUser: User = {
  id: 'user-1',
  status: 'active',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const dict = {
  nav: 'Profile',
  profile: {
    title: 'My Profile',
    subtitle: 'Manage your personal information',
    username: 'Username',
    usernamePlaceholder: 'your_username',
    usernameMin: 'At least 3 characters',
    usernameMax: 'At most 30 characters',
    firstName: 'First name',
    firstNamePlaceholder: 'John',
    lastName: 'Last name',
    lastNamePlaceholder: 'Doe',
    avatarUrl: 'Avatar URL',
    avatarUrlPlaceholder: 'https://...',
    bio: 'Bio',
    bioPlaceholder: 'Tell us a bit about yourself...',
    bioMax: 'At most 500 characters',
    locale: 'Locale',
    localePlaceholder: 'e.g. en-US',
    timezone: 'Timezone',
    timezonePlaceholder: 'e.g. America/New_York',
    save: 'Save changes',
    saving: 'Saving...',
    saveSuccess: 'Profile updated successfully',
    saveError: 'Could not update profile. Try again.',
    loadError: 'Could not load your profile. Try again.',
    memberSince: 'Member since',
  },
};

function setupAuth({
  isBootComplete = true,
  currentUser = { id: 'user-1', email: 'john@example.com' },
}: {
  isBootComplete?: boolean;
  currentUser?: { id: string; email: string } | null;
} = {}) {
  mockAuthSelector.mockImplementation((selector) =>
    selector({ isBootComplete, currentUser })
  );
}

describe('UserProfileScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAuth();
  });

  it('shows skeleton while auth boot is incomplete', () => {
    setupAuth({ isBootComplete: false });
    mockUseUser.mockReturnValue({ data: undefined, isLoading: false, isError: false });

    const { container } = render(<UserProfileScreen dict={dict} lang="en" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows skeleton while user query is loading', () => {
    mockUseUser.mockReturnValue({ data: undefined, isLoading: true, isError: false });

    const { container } = render(<UserProfileScreen dict={dict} lang="en" />);

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders profile form when user data is available', () => {
    mockUseUser.mockReturnValue({ data: mockUser, isLoading: false, isError: false });

    render(<UserProfileScreen dict={dict} lang="en" />);

    expect(screen.getByRole('heading', { name: /my profile/i })).toBeInTheDocument();
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('shows an error alert instead of a blank screen when user query fails', () => {
    mockUseUser.mockReturnValue({ data: undefined, isLoading: false, isError: true });

    render(<UserProfileScreen dict={dict} lang="en" />);

    expect(screen.getByText('Could not load your profile. Try again.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save changes/i })).not.toBeInTheDocument();
  });
});
