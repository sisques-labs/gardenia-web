import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { AppShell } from './app-shell';
import { useMobileMenu } from './mobile-menu.context';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

function MobileMenuConsumer() {
  const menu = useMobileMenu();
  return menu ? (
    <button type="button" aria-label={menu.label} onClick={menu.onOpen}>
      toggle
    </button>
  ) : null;
}

const shellDict: AppDict['shell'] = {
  openNavigation: 'Open navigation',
  sidebar: { expand: 'Expand sidebar', collapse: 'Collapse sidebar' },
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
  nav: {
    home: 'Home',
    map: 'Map',
    plants: 'Plants',
    identifyPlant: 'Identify plant',
    calendar: 'Calendar',
    journal: 'Journal',
    harvests: 'Harvests',
    inventory: 'Inventory',
    pests: 'Pests',
    community: 'Community',
    plantingSpots: 'Planting spots',
  },
};

vi.mock('../sidebar/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar-mock" />,
}));

beforeEach(() => {
  localStorage.clear();
  useSidebarStore.setState({ collapsed: false, drawerOpen: false });
});

describe('AppShell', () => {
  it('renders children inside the main area', () => {
    render(<AppShell dict={shellDict}><p>Page content</p></AppShell>);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('Page content');
  });

  it('renders a sidebar region', () => {
    render(<AppShell dict={shellDict}><p>content</p></AppShell>);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('applies --sidebar-width CSS var (240px) when expanded', () => {
    render(<AppShell dict={shellDict}><p>content</p></AppShell>);
    expect(screen.getByTestId('app-shell')).toHaveStyle({ '--sidebar-width': '240px' });
  });

  it('applies --sidebar-width CSS var (64px) when collapsed', () => {
    useSidebarStore.setState({ collapsed: true });
    render(<AppShell dict={shellDict}><p>content</p></AppShell>);
    expect(screen.getByTestId('app-shell')).toHaveStyle({ '--sidebar-width': '64px' });
  });

  it('renders mobile overlay when drawer is open', () => {
    useSidebarStore.setState({ drawerOpen: true });
    render(<AppShell dict={shellDict}><p>content</p></AppShell>);
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
  });

  it('does not render overlay when drawer is closed', () => {
    render(<AppShell dict={shellDict}><p>content</p></AppShell>);
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
  });

  it('exposes the mobile menu label and toggle via context so ScreenHeader renders one merged header', () => {
    render(<AppShell dict={shellDict}><MobileMenuConsumer /></AppShell>);
    expect(screen.getByLabelText(shellDict.openNavigation)).toHaveAttribute('type', 'button');
  });

  it('opens the drawer when the mobile menu context toggle is invoked', async () => {
    const user = userEvent.setup();
    render(<AppShell dict={shellDict}><MobileMenuConsumer /></AppShell>);
    await user.click(screen.getByLabelText(shellDict.openNavigation));
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
  });
});
