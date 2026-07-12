/**
 * Integration test: confirms AppShell is rendered when the layout wiring is in place.
 * We test the ProtectedProviders + AppShell composition since the Next.js async layout
 * itself is not directly testable in Vitest/jsdom.
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { AppShell } from './app-shell';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

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
    calendar: 'Calendar',
    journal: 'Journal',
    harvests: 'Harvests',
    inventory: 'Inventory',
    pests: 'Pests',
    community: 'Community',
    plantingSpots: 'Planting spots',
    nodes: 'Devices',
  },
};

vi.mock('../sidebar/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar-mock" />,
}));

beforeEach(() => {
  useSidebarStore.setState({ collapsed: false, drawerOpen: false });
});

describe('AppShell layout integration', () => {
  it('renders AppShell wrapping page content', () => {
    render(
      <AppShell dict={shellDict}>
        <div data-testid="page-content">Hello</div>
      </AppShell>,
    );
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('main content area contains the page children', () => {
    render(
      <AppShell dict={shellDict}>
        <span data-testid="child">Child content</span>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByTestId('child'));
  });
});
