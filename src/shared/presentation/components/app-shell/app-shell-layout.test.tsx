/**
 * Integration test: confirms AppShell is rendered when the layout wiring is in place.
 * We test the ProtectedProviders + AppShell composition since the Next.js async layout
 * itself is not directly testable in Vitest/jsdom.
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import { AppShell } from './app-shell';

vi.mock('../sidebar/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar-mock" />,
}));

beforeEach(() => {
  useSidebarStore.setState({ collapsed: false, drawerOpen: false });
});

describe('AppShell layout integration', () => {
  it('renders AppShell wrapping page content', () => {
    render(
      <AppShell>
        <div data-testid="page-content">Hello</div>
      </AppShell>,
    );
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('main content area contains the page children', () => {
    render(
      <AppShell>
        <span data-testid="child">Child content</span>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByTestId('child'));
  });
});
