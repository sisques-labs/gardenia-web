import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpaceMembersList } from './space-members-list';
import type { User } from '@/core/users/domain/interfaces/user.interface';

const { mockUseSpaceMembers } = vi.hoisted(() => ({
  mockUseSpaceMembers: vi.fn(),
}));

vi.mock(
  '@/core/spaces/presentation/hooks/use-space-members/use-space-members.hook',
  () => ({ useSpaceMembers: mockUseSpaceMembers }),
);

const dict = {
  loading: 'Loading members...',
  empty: 'No members yet.',
};

const mockMembers: User[] = [
  {
    id: 'user-1',
    status: 'active',
    username: 'jdoe',
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: null,
    createdAt: '2024-01-01',
  },
  {
    id: 'user-2',
    status: 'invited',
    username: 'jane',
    firstName: null,
    lastName: null,
    avatarUrl: 'https://example.com/avatar.png',
    createdAt: '2024-01-02',
  },
];

describe('SpaceMembersList', () => {
  it('shows skeleton rows while loading', () => {
    mockUseSpaceMembers.mockReturnValue({ data: undefined, isLoading: true });

    render(<SpaceMembersList dict={dict} />);

    expect(screen.getByLabelText(dict.loading)).toBeInTheDocument();
  });

  it('shows empty message when there are no members', () => {
    mockUseSpaceMembers.mockReturnValue({ data: [], isLoading: false });

    render(<SpaceMembersList dict={dict} />);

    expect(screen.getByText(dict.empty)).toBeInTheDocument();
  });

  it('renders a list item for each member', () => {
    mockUseSpaceMembers.mockReturnValue({ data: mockMembers, isLoading: false });

    render(<SpaceMembersList dict={dict} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('@jdoe')).toBeInTheDocument();
    // Falls back to username when no name
    expect(screen.getByText('jane')).toBeInTheDocument();
    expect(screen.getByText('@jane')).toBeInTheDocument();
  });

  it('renders an img when avatarUrl is set', () => {
    mockUseSpaceMembers.mockReturnValue({ data: [mockMembers[1]], isLoading: false });

    render(<SpaceMembersList dict={dict} />);

    const img = screen.getByRole('img', { name: 'jane' });
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
  });

  it('renders the initial letter div when avatarUrl is absent', () => {
    mockUseSpaceMembers.mockReturnValue({ data: [mockMembers[0]], isLoading: false });

    render(<SpaceMembersList dict={dict} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    // The initial "J" is rendered inside a div
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
