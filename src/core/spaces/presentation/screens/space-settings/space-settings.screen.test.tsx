import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SpaceSettingsScreen } from './space-settings.screen';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

vi.mock('@/shared/presentation/components/screen-header/screen-header', () => ({
  ScreenHeader: ({ title }: { title: string }) => (
    <div data-testid="screen-header" data-title={title} />
  ),
}));

vi.mock('@/shared/presentation/components/in-development/in-development', () => ({
  InDevelopment: ({ label }: { label: string }) => (
    <div data-testid="in-development">{label}</div>
  ),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn(() => 'space-123'),
}));

vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: vi.fn(() => 'user-owner-id'),
}));

const mockResetInv = vi.fn();
const mockResetAdd = vi.fn();
const mockResetRemove = vi.fn();

vi.mock('@/core/spaces/presentation/hooks/use-space-detail/useSpaceDetail.hook', () => ({
  useSpaceDetail: vi.fn(),
}));

vi.mock('@/core/spaces/presentation/hooks/use-create-invitation/useCreateInvitation.hook', () => ({
  useCreateInvitation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    data: undefined,
    reset: mockResetInv,
  })),
}));

vi.mock('@/core/spaces/presentation/hooks/use-add-member/useAddMember.hook', () => ({
  useAddMember: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    isSuccess: false,
    reset: mockResetAdd,
  })),
}));

vi.mock('@/core/spaces/presentation/hooks/use-remove-member/useRemoveMember.hook', () => ({
  useRemoveMember: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
    isSuccess: false,
    reset: mockResetRemove,
  })),
}));

import { useSpaceDetail } from '@/core/spaces/presentation/hooks/use-space-detail/useSpaceDetail.hook';
import { useCreateInvitation } from '@/core/spaces/presentation/hooks/use-create-invitation/useCreateInvitation.hook';

const mockUseSpaceDetail = vi.mocked(useSpaceDetail);
const mockUseCreateInvitation = vi.mocked(useCreateInvitation);

const dict = {
  title: 'Space settings',
  details: {
    title: 'Space details',
    name: 'Name',
    owner: 'Owner',
    createdAt: 'Created',
  },
  invitation: {
    title: 'Create invitation',
    roleLabel: 'Role',
    roleMember: 'Member',
    roleOwner: 'Owner',
    expiresLabel: 'Expires at (optional)',
    submit: 'Generate invitation',
    submitting: 'Generating...',
    code: 'Code',
    copyCode: 'Copy code',
    copyLink: 'Copy invite link',
    codeCopied: 'Code copied!',
    linkCopied: 'Link copied!',
    qrHint: 'Share this QR or the code above to invite someone',
  },
  members: {
    title: 'Members',
    pendingApi: 'Member list will be available in a future update.',
    addTitle: 'Add member',
    addUserId: 'User ID',
    addUserIdPlaceholder: 'Paste UUID here',
    addSubmit: 'Add',
    addSubmitting: 'Adding...',
    addSuccess: 'Member added successfully',
    removeTitle: 'Remove member',
    removeUserId: 'User ID',
    removeUserIdPlaceholder: 'Paste UUID here',
    removeSubmit: 'Remove',
    removeSubmitting: 'Removing...',
    removeSuccess: 'Member removed successfully',
    confirmRemove: 'Are you sure you want to remove this member?',
  },
  errors: {
    loadFailed: 'Could not load space details. Try again.',
    invitationFailed: 'Could not create the invitation. Try again.',
    addFailed: 'Could not add the member. Try again.',
    removeFailed: 'Could not remove the member. Try again.',
  },
} as const;

describe('SpaceSettingsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders ScreenHeader with the settings title', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    const header = screen.getByTestId('screen-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('data-title', 'Space settings');
  });

  it('shows loading skeleton when isLoading is true', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    const { container } = render(<SpaceSettingsScreen dict={dict} lang="en" />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('shows error alert when isError is true', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    expect(screen.getByText(dict.errors.loadFailed)).toBeInTheDocument();
  });

  it('renders space details when data is loaded', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: {
        id: 'space-123',
        name: 'My Space',
        ownerId: 'other-user-id',
        createdAt: '2024-01-15T10:00:00Z',
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    expect(screen.getByTestId('space-name')).toHaveTextContent('My Space');
    expect(screen.getByTestId('space-owner')).toHaveTextContent('other-user-id');
    expect(screen.getByTestId('space-created-at')).toBeInTheDocument();
  });

  it('hides invitation card for non-owner', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: {
        id: 'space-123',
        name: 'My Space',
        ownerId: 'other-user-id',
        createdAt: '2024-01-15T10:00:00Z',
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    expect(screen.queryByTestId('invitation-submit')).not.toBeInTheDocument();
  });

  it('shows invitation card for owner', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: {
        id: 'space-123',
        name: 'My Space',
        ownerId: 'user-owner-id',
        createdAt: '2024-01-15T10:00:00Z',
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    expect(screen.getByTestId('invitation-submit')).toBeInTheDocument();
    expect(screen.getByTestId('invitation-role-select')).toBeInTheDocument();
    expect(screen.getByTestId('invitation-expires-input')).toBeInTheDocument();
  });

  it('shows add/remove member forms for owner', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: {
        id: 'space-123',
        name: 'My Space',
        ownerId: 'user-owner-id',
        createdAt: '2024-01-15T10:00:00Z',
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    expect(screen.getByTestId('add-member-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-member-submit')).toBeInTheDocument();
    expect(screen.getByTestId('remove-member-input')).toBeInTheDocument();
    expect(screen.getByTestId('remove-member-submit')).toBeInTheDocument();
  });

  it('hides add/remove member forms for non-owner', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: {
        id: 'space-123',
        name: 'My Space',
        ownerId: 'other-user-id',
        createdAt: '2024-01-15T10:00:00Z',
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    expect(screen.queryByTestId('add-member-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('remove-member-input')).not.toBeInTheDocument();
  });

  it('shows InDevelopment component in members section', () => {
    mockUseSpaceDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    const inDev = screen.getByTestId('in-development');
    expect(inDev).toBeInTheDocument();
    expect(inDev).toHaveTextContent(dict.members.pendingApi);
  });

  it('shows invitation result with displayCode and copy buttons', () => {
    mockUseCreateInvitation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
      data: {
        id: 'inv-1',
        displayCode: 'ABC-123',
        code: 'raw-code-abc123',
        qrId: null,
        expiresAt: '2024-12-31T23:59:59Z',
        role: 'member',
        spaceId: 'space-123',
      },
      reset: mockResetInv,
    } as unknown as ReturnType<typeof useCreateInvitation>);

    mockUseSpaceDetail.mockReturnValue({
      data: {
        id: 'space-123',
        name: 'My Space',
        ownerId: 'user-owner-id',
        createdAt: '2024-01-15T10:00:00Z',
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    expect(screen.getByTestId('invitation-result')).toBeInTheDocument();
    expect(screen.getByTestId('invitation-display-code')).toHaveTextContent('ABC-123');
    expect(screen.getByTestId('copy-code-btn')).toBeInTheDocument();
    expect(screen.getByTestId('copy-link-btn')).toBeInTheDocument();
  });

  it('shows QR image when invitation has qrId', () => {
    mockUseCreateInvitation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
      data: {
        id: 'inv-1',
        displayCode: 'ABC-123',
        code: 'raw-code-abc123',
        qrId: 'qr-uuid-456',
        expiresAt: '2024-12-31T23:59:59Z',
        role: 'member',
        spaceId: 'space-123',
      },
      reset: mockResetInv,
    } as unknown as ReturnType<typeof useCreateInvitation>);

    mockUseSpaceDetail.mockReturnValue({
      data: {
        id: 'space-123',
        name: 'My Space',
        ownerId: 'user-owner-id',
        createdAt: '2024-01-15T10:00:00Z',
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useSpaceDetail>);

    render(<SpaceSettingsScreen dict={dict} lang="en" />);
    const qrImg = screen.getByTestId('invitation-qr');
    expect(qrImg).toBeInTheDocument();
    expect(qrImg).toHaveAttribute('src', '/api/qrs/qr-uuid-456/image');
  });
});
