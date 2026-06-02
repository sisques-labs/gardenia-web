import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarProvider, useSidebar } from './sidebar.context';

// Helper: consumer component
function Consumer() {
  const { collapsed, drawerOpen, toggleCollapsed, openDrawer, closeDrawer } = useSidebar();
  return (
    <div>
      <span data-testid="collapsed">{String(collapsed)}</span>
      <span data-testid="drawerOpen">{String(drawerOpen)}</span>
      <button onClick={toggleCollapsed}>toggle</button>
      <button onClick={openDrawer}>open</button>
      <button onClick={closeDrawer}>close</button>
    </div>
  );
}

describe('SidebarProvider / useSidebar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('throws when useSidebar is used outside SidebarProvider', () => {
    // Suppress React's console.error for this expected throw
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow();
    spy.mockRestore();
  });

  it('provides collapsed=false by default', () => {
    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>,
    );
    expect(screen.getByTestId('collapsed').textContent).toBe('false');
  });

  it('provides drawerOpen=false by default', () => {
    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>,
    );
    expect(screen.getByTestId('drawerOpen').textContent).toBe('false');
  });

  it('toggleCollapsed flips collapsed state', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>,
    );
    expect(screen.getByTestId('collapsed').textContent).toBe('false');
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('collapsed').textContent).toBe('true');
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(screen.getByTestId('collapsed').textContent).toBe('false');
  });

  it('toggleCollapsed persists collapsed state to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(localStorage.getItem('gardenia.sidebar.collapsed')).toBe('true');
    await user.click(screen.getByRole('button', { name: 'toggle' }));
    expect(localStorage.getItem('gardenia.sidebar.collapsed')).toBe('false');
  });

  it('reads collapsed initial value from localStorage', () => {
    localStorage.setItem('gardenia.sidebar.collapsed', 'true');
    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>,
    );
    expect(screen.getByTestId('collapsed').textContent).toBe('true');
  });

  it('openDrawer sets drawerOpen=true', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.getByTestId('drawerOpen').textContent).toBe('true');
  });

  it('closeDrawer sets drawerOpen=false', async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Consumer />
      </SidebarProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.getByTestId('drawerOpen').textContent).toBe('true');
    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.getByTestId('drawerOpen').textContent).toBe('false');
  });
});
