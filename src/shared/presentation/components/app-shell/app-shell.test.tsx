import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SidebarProvider } from '../sidebar/sidebar.context';
import { AppShell } from './app-shell';

// Sidebar renders SpaceSwitcher which needs react-query — mock at unit level
vi.mock('../sidebar/sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar-mock" />,
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

describe('AppShell', () => {
  it('renders children inside the main area', () => {
    render(
      <Wrapper>
        <AppShell>
          <p>Page content</p>
        </AppShell>
      </Wrapper>,
    );
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('Page content');
  });

  it('renders a sidebar region', () => {
    render(
      <Wrapper>
        <AppShell>
          <p>content</p>
        </AppShell>
      </Wrapper>,
    );
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('applies --sidebar-width CSS var (240px) when expanded', () => {
    render(
      <Wrapper>
        <AppShell>
          <p>content</p>
        </AppShell>
      </Wrapper>,
    );
    // The shell root carries the inline --sidebar-width style
    const shell = screen.getByTestId('app-shell');
    expect(shell).toHaveStyle({ '--sidebar-width': '240px' });
  });

  it('applies --sidebar-width CSS var (64px) when collapsed', async () => {
    // Pre-seed localStorage so SidebarProvider starts collapsed
    localStorage.setItem('gardenia.sidebar.collapsed', 'true');
    const user = userEvent.setup();

    render(
      <Wrapper>
        <AppShell>
          <p>content</p>
        </AppShell>
      </Wrapper>,
    );

    const shell = screen.getByTestId('app-shell');
    expect(shell).toHaveStyle({ '--sidebar-width': '64px' });
    localStorage.clear();
  });
});
