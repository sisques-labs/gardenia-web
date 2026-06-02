/**
 * Integration test: confirms AppShell is rendered when the layout wiring is in place.
 * We test the ProtectedProviders + AppShell composition since the Next.js async layout
 * itself is not directly testable in Vitest/jsdom.
 */
import { render, screen } from '@testing-library/react';
import { SidebarProvider } from '../sidebar/sidebar.context';
import { AppShell } from './app-shell';

describe('AppShell layout integration', () => {
  it('renders AppShell wrapping page content via SidebarProvider', () => {
    render(
      <SidebarProvider>
        <AppShell>
          <div data-testid="page-content">Hello</div>
        </AppShell>
      </SidebarProvider>,
    );

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('page-content')).toBeInTheDocument();
  });

  it('main content area contains the page children', () => {
    render(
      <SidebarProvider>
        <AppShell>
          <span data-testid="child">Child content</span>
        </AppShell>
      </SidebarProvider>,
    );

    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByTestId('child'));
  });
});
