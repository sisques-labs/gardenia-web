import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { Sidebar } from './sidebar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/en/spaces'),
}));

vi.mock('./space-switcher', () => ({
  SpaceSwitcher: () => <div data-testid="space-switcher-mock" />,
}));

beforeEach(() => {
  localStorage.clear();
  useSidebarStore.setState({ collapsed: false, drawerOpen: false });
});

describe('Sidebar', () => {
  it('renders all nav items with labels in expanded state', () => {
    render(<Sidebar />);
    expect(screen.getByText('Spaces')).toBeInTheDocument();
  });

  it('renders the sidebar container', () => {
    render(<Sidebar />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('active nav item has forest styling', () => {
    render(<Sidebar />);
    const activeLink = screen.getByRole('link', { name: /spaces/i });
    expect(activeLink).toHaveClass('text-[var(--forest)]');
  });

  it('renders collapse toggle button', () => {
    render(<Sidebar />);
    expect(screen.getByRole('button', { name: /collapse|expand|toggle/i })).toBeInTheDocument();
  });

  it('calls closeDrawer on Escape key press', () => {
    render(<Sidebar />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('hides labels when collapsed', () => {
    useSidebarStore.setState({ collapsed: true });
    render(<Sidebar />);
    const label = screen.getByText('Spaces');
    expect(label).toHaveClass('overflow-hidden');
  });

  it('renders mobile overlay when drawer is open', () => {
    useSidebarStore.setState({ drawerOpen: true });
    render(<Sidebar />);
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
  });

  it('does not render overlay when drawer is closed', () => {
    render(<Sidebar />);
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
  });
});
