import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { SidebarFooter } from './sidebar-footer';
import type { SpacesState } from '@/core/spaces/infrastructure/store/spaces.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

vi.mock('@/core/spaces/presentation/hooks/use-spaces/use-spaces.hook', () => ({
  useSpaces: vi.fn(),
}));
vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn(),
}));

const mockLogout = vi.fn();
const mockSetActiveSpace = vi.fn();

vi.mock('@/core/auth/presentation/hooks/use-logout/useLogout.hook', () => ({
  useLogout: () => ({
    mutate: mockLogout,
    isPending: false,
  }),
}));

import { useSpaces } from '@/core/spaces/presentation/hooks/use-spaces/use-spaces.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const dict = {
  spaceSwitcher: {
    activeSpaceLabel: 'Active garden',
    switchSpace: 'Switch space',
    createSpace: 'New space',
  },
  userMenu: {
    openMenu: 'Open menu',
    profile: 'Profile',
    settings: 'Settings',
    logOut: 'Log out',
  },
} satisfies {
  spaceSwitcher: AppDict['shell']['spaceSwitcher'];
  userMenu: AppDict['shell']['userMenu'];
};

const mockSpaces = [
  { id: 'space-1', name: 'Design Team', ownerId: 'user-1', createdAt: '2026-01-01' },
  { id: 'space-2', name: 'Engineering', ownerId: 'user-1', createdAt: '2026-01-01' },
];

const makeStoreState = (overrides: Partial<SpacesState> = {}): SpacesState => ({
  availableSpaces: mockSpaces,
  currentSpaceId: 'space-1',
  isResolved: true,
  setSpaces: vi.fn(),
  setActiveSpace: mockSetActiveSpace,
  resolveActiveSpace: vi.fn(),
  clear: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  useSidebarStore.setState({ collapsed: false, drawerOpen: false });
  useAuthStore.setState({
    accessToken: 'tok',
    currentUser: { id: 'account-1', userId: 'user-1', email: 'javi@example.com' },
    isBootComplete: true,
  });
  vi.mocked(useSpaces).mockReturnValue({ data: mockSpaces } as unknown as ReturnType<typeof useSpaces>);
  vi.mocked(useSpacesStore).mockImplementation((selector) => selector(makeStoreState()));
  mockLogout.mockClear();
  mockSetActiveSpace.mockClear();
});

describe('SidebarFooter', () => {
  it('renders active space and user when expanded', () => {
    render(<SidebarFooter dict={dict} locale="en" />);
    expect(screen.getByText('Active garden')).toBeInTheDocument();
    expect(screen.getByText('Design Team')).toBeInTheDocument();
    expect(screen.getByText('javi')).toBeInTheDocument();
  });

  it('hides details when sidebar is collapsed', () => {
    useSidebarStore.setState({ collapsed: true });
    render(<SidebarFooter dict={dict} locale="en" />);
    expect(screen.queryByText('Design Team')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
  });

  it('opens menu with space switch, profile and logout', async () => {
    const user = userEvent.setup();
    render(<SidebarFooter dict={dict} locale="en" />);

    await user.click(screen.getByLabelText('Open menu'));

    expect(screen.getByText('Switch space')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /design team/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /engineering/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /new space/i })).toHaveAttribute('href', '/en/spaces/new');
  });

  it('shows space list with a single space', async () => {
    vi.mocked(useSpacesStore).mockImplementation((selector) =>
      selector(makeStoreState({ availableSpaces: [mockSpaces[0]] })),
    );

    const user = userEvent.setup();
    render(<SidebarFooter dict={dict} locale="en" />);

    await user.click(screen.getByLabelText('Open menu'));

    expect(screen.getByText('Switch space')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /design team/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /engineering/i })).not.toBeInTheDocument();
  });

  it('switches space from the menu', async () => {
    const user = userEvent.setup();
    render(<SidebarFooter dict={dict} locale="en" />);

    await user.click(screen.getByLabelText('Open menu'));
    await user.click(screen.getByRole('menuitem', { name: /engineering/i }));

    expect(mockSetActiveSpace).toHaveBeenCalledWith('space-2');
  });

  it('links profile to the locale profile route', async () => {
    const user = userEvent.setup();
    render(<SidebarFooter dict={dict} locale="es" onNavigate={vi.fn()} />);

    await user.click(screen.getByLabelText('Open menu'));

    expect(screen.getByRole('menuitem', { name: /profile/i })).toHaveAttribute('href', '/es/profile');
  });

  it('calls logout when log out is clicked', async () => {
    const user = userEvent.setup();
    render(<SidebarFooter dict={dict} locale="en" />);

    await user.click(screen.getByLabelText('Open menu'));
    await user.click(screen.getByRole('menuitem', { name: /log out/i }));

    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it('renders empty container when no user and no spaces', () => {
    useAuthStore.setState({ currentUser: null, accessToken: null });
    vi.mocked(useSpacesStore).mockImplementation((selector) =>
      selector(makeStoreState({ availableSpaces: [], currentSpaceId: null })),
    );
    vi.mocked(useSpaces).mockReturnValue({ data: [] } as unknown as ReturnType<typeof useSpaces>);

    render(<SidebarFooter dict={dict} locale="en" />);
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
    expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
  });
});
