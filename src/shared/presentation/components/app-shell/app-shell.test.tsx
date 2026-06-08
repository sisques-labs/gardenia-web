import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { AppShell } from './app-shell';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shellDict: AppDict['shell'] = {
  openNavigation: 'Open navigation',
  sidebar: { expand: 'Expand sidebar', collapse: 'Collapse sidebar' },
  spaceSwitcher: { activeSpaceLabel: 'Active garden', switchSpace: 'Switch space' },
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
});
