import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { SpaceInviteScreen } from './space-invite.screen';

function buildGraphQLError(code: string) {
  return new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'boom', extensions: { code } }],
  });
}

const mockPush = vi.hoisted(() => vi.fn());
const mockReplace = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() => vi.fn());
const mockAcceptInvitation = vi.hoisted(() => vi.fn());
let mockAccessToken: string | null = vi.hoisted(() => 'token-1') as string | null;
let mockPreview: {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data: { spaceName: string; role: 'MEMBER' | 'OWNER'; expiresAt: string; isExpired: boolean } | undefined;
} = vi.hoisted(() => ({
  isLoading: false,
  isError: false,
  error: null,
  data: { spaceName: 'Greenhouse A', role: 'MEMBER', expiresAt: '2026-12-31', isExpired: false },
})) as never;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => ({ get: mockGet }),
}));

vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: (selector: (s: { isBootComplete: boolean; accessToken: string | null }) => unknown) =>
    selector({ isBootComplete: true, accessToken: mockAccessToken }),
}));

vi.mock('@/core/spaces/presentation/hooks/use-accept-invitation/use-accept-invitation.hook', () => ({
  useAcceptInvitation: () => ({ mutateAsync: mockAcceptInvitation, isPending: false }),
}));

vi.mock(
  '@/core/spaces/presentation/hooks/use-space-invitation-preview/use-space-invitation-preview.hook',
  () => ({
    useSpaceInvitationPreview: () => mockPreview,
  }),
);

const dict = {
  missingCode: 'This invitation link is invalid or missing a code.',
  previewLoading: 'Loading invitation...',
  joinPromptAuthenticated: "You've been invited to {spaceName} as {role}.",
  joinPromptUnauthenticated:
    "You've been invited to {spaceName} as {role}. Sign in to continue.",
  signInCta: 'Sign in to continue',
  joinCta: 'Join',
  joining: 'Joining...',
  success: "You've joined {spaceName}.",
  roleMember: 'member',
  roleOwner: 'owner',
  errors: {
    InvitationNotFoundException: 'This invitation was not found.',
    InvitationExpiredException: 'This invitation has expired. Ask the space owner for a new link.',
    DuplicateMembershipException: "You're already a member of this space.",
    fallback: 'Could not accept the invitation. Try again.',
  },
};

describe('SpaceInviteScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccessToken = 'token-1';
    mockPreview = {
      isLoading: false,
      isError: false,
      error: null,
      data: { spaceName: 'Greenhouse A', role: 'MEMBER', expiresAt: '2026-12-31', isExpired: false },
    };
    sessionStorage.clear();
  });

  it('shows missingCode when there is no ?code=', () => {
    mockGet.mockReturnValue(null);
    render(<SpaceInviteScreen dict={dict} lang="en" />);
    expect(screen.getByText(dict.missingCode)).toBeInTheDocument();
  });

  it('shows the join prompt with space name and role for an authenticated user', () => {
    mockGet.mockReturnValue('CODE-1');
    render(<SpaceInviteScreen dict={dict} lang="en" />);
    expect(screen.getByText("You've been invited to Greenhouse A as member.")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument();
  });

  it('shows a sign-in CTA instead of a join button when unauthenticated', () => {
    mockGet.mockReturnValue('CODE-1');
    mockAccessToken = null;
    render(<SpaceInviteScreen dict={dict} lang="en" />);

    expect(
      screen.getByText("You've been invited to Greenhouse A as member. Sign in to continue."),
    ).toBeInTheDocument();
    const cta = screen.getByRole('button', { name: 'Sign in to continue' });
    cta.click();

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/en/login?returnUrl='),
    );
    expect(mockAcceptInvitation).not.toHaveBeenCalled();
  });

  it('does not call acceptInvitation automatically', () => {
    mockGet.mockReturnValue('CODE-1');
    render(<SpaceInviteScreen dict={dict} lang="en" />);
    expect(mockAcceptInvitation).not.toHaveBeenCalled();
  });

  it('shows the expired message and no join button when the invitation is expired', () => {
    mockGet.mockReturnValue('CODE-1');
    mockPreview.data = { ...mockPreview.data!, isExpired: true };
    render(<SpaceInviteScreen dict={dict} lang="en" />);

    expect(screen.getByText(dict.errors.InvitationExpiredException)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Join' })).not.toBeInTheDocument();
  });

  it('shows a not-found message when the preview query fails with that code', () => {
    mockGet.mockReturnValue('BADCODE');
    mockPreview.isError = true;
    mockPreview.data = undefined;
    mockPreview.error = buildGraphQLError('InvitationNotFoundException');
    render(<SpaceInviteScreen dict={dict} lang="en" />);

    expect(screen.getByText(dict.errors.InvitationNotFoundException)).toBeInTheDocument();
  });

  it('accepts the invitation on Join click and shows a success message', async () => {
    mockGet.mockReturnValue('CODE-1');
    mockAcceptInvitation.mockResolvedValue('space-1');
    render(<SpaceInviteScreen dict={dict} lang="en" />);

    screen.getByRole('button', { name: 'Join' }).click();

    await waitFor(() => expect(mockAcceptInvitation).toHaveBeenCalledWith('CODE-1'));
    await waitFor(() =>
      expect(screen.getByText("You've joined Greenhouse A.")).toBeInTheDocument(),
    );
  });

  it('shows a structured error message when accept fails with a known code', async () => {
    mockGet.mockReturnValue('CODE-1');
    mockAcceptInvitation.mockRejectedValue(buildGraphQLError('InvitationExpiredException'));
    render(<SpaceInviteScreen dict={dict} lang="en" />);

    screen.getByRole('button', { name: 'Join' }).click();

    await waitFor(() =>
      expect(screen.getByText(dict.errors.InvitationExpiredException)).toBeInTheDocument(),
    );
  });
});
