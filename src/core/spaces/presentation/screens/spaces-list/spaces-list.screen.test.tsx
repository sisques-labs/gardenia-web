import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SpacesListScreen } from './spaces-list.screen';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/core/spaces/presentation/hooks/use-spaces/useSpaces.hook', () => ({
  useSpaces: vi.fn(() => ({ data: [] })),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn((selector: (s: { currentSpaceId: null; setActiveSpace: () => void }) => unknown) =>
    selector({ currentSpaceId: null, setActiveSpace: vi.fn() })
  ),
}));

// Mock ScreenHeader to verify it's rendered
vi.mock('@/shared/presentation/components/screen-header/screen-header', () => ({
  ScreenHeader: ({ title }: { title: string }) => (
    <div data-testid="screen-header" data-title={title} />
  ),
}));

const dict = {
  title: 'My spaces',
  empty: 'You have no spaces yet.',
  create: 'New space',
  switchTo: 'Switch to this space',
  active: 'Active',
};

describe('SpacesListScreen', () => {
  it('renders ScreenHeader with title "Spaces"', () => {
    render(<SpacesListScreen dict={dict} lang="en" />);
    const header = screen.getByTestId('screen-header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute('data-title', 'Spaces');
  });

  it('does not apply min-h-screen to root element', () => {
    const { container } = render(<SpacesListScreen dict={dict} lang="en" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root?.className).not.toContain('min-h-screen');
  });

  it('does not apply max-w-2xl mx-auto centering to root element', () => {
    const { container } = render(<SpacesListScreen dict={dict} lang="en" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root?.className).not.toContain('max-w-2xl');
    expect(root?.className).not.toContain('mx-auto');
  });

  it('renders empty state message', () => {
    render(<SpacesListScreen dict={dict} lang="en" />);
    expect(screen.getByText('You have no spaces yet.')).toBeInTheDocument();
  });
});
