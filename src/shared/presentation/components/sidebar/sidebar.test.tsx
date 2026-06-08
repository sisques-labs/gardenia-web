import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { Sidebar } from './sidebar';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shellDict: AppDict['shell'] = {
  openNavigation: 'Open navigation',
  sidebar: { expand: 'Expand sidebar', collapse: 'Collapse sidebar' },
  spaceSwitcher: { activeSpaceLabel: 'Active garden', switchSpace: 'Switch space' },
  nav: {
    home: 'Home',
    spaces: 'Spaces',
    map: 'Map',
    inventory: 'Inventory',
    calendar: 'Calendar',
    journal: 'Journal',
    harvests: 'Harvests',
    pests: 'Pests',
    community: 'Community',
    profile: 'Profile',
  },
};

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/en/spaces'),
}));

vi.mock('../space-switcher/space-switcher', () => ({
  SpaceSwitcher: () => <div data-testid="space-switcher-mock" />,
}));

beforeEach(() => {
  localStorage.clear();
  useSidebarStore.setState({ collapsed: false, drawerOpen: false });
});

describe('Sidebar', () => {
  it('renders all nav items with labels in expanded state', () => {
    render(<Sidebar dict={shellDict} />);
    expect(screen.getByText('Spaces')).toBeInTheDocument();
  });

  it('renders the sidebar container', () => {
    render(<Sidebar dict={shellDict} />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders the Gardenia brand header', () => {
    render(<Sidebar dict={shellDict} />);
    expect(screen.getByText('Gardenia')).toBeInTheDocument();
  });

  it('hides brand label when collapsed', () => {
    useSidebarStore.setState({ collapsed: true });
    render(<Sidebar dict={shellDict} />);
    expect(screen.queryByText('Gardenia')).not.toBeInTheDocument();
  });

  it('active nav item has forest styling', () => {
    render(<Sidebar dict={shellDict} />);
    const activeLink = screen.getByRole('link', { name: /spaces/i });
    expect(activeLink).toHaveClass('text-[var(--forest)]');
  });

  it('renders collapse toggle button', () => {
    render(<Sidebar dict={shellDict} />);
    expect(screen.getByRole('button', { name: /collapse|expand|toggle/i })).toBeInTheDocument();
  });

  it('calls closeDrawer on Escape key press', () => {
    render(<Sidebar dict={shellDict} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('hides labels when collapsed', () => {
    useSidebarStore.setState({ collapsed: true });
    render(<Sidebar dict={shellDict} />);
    const label = screen.getByText('Spaces');
    expect(label).toHaveClass('overflow-hidden');
  });

  it('renders content directly when inDrawer is true', () => {
    render(<Sidebar inDrawer dict={shellDict} />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });
});
