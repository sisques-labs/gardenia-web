import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SpaceSwitcher } from './space-switcher';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import type { SpacesState } from '@/core/spaces/infrastructure/store/spaces.store';

vi.mock('@/core/spaces/presentation/hooks/use-spaces/useSpaces.hook', () => ({
  useSpaces: vi.fn(),
}));
vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn(),
}));

import { useSpaces } from '@/core/spaces/presentation/hooks/use-spaces/useSpaces.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const mockSpaces = [
  { id: 'space-1', name: 'Design Team', ownerId: 'user-1', createdAt: '2026-01-01' },
  { id: 'space-2', name: 'Engineering', ownerId: 'user-1', createdAt: '2026-01-01' },
];

const makeStoreState = (overrides: Partial<SpacesState> = {}): SpacesState => ({
  availableSpaces: mockSpaces,
  currentSpaceId: 'space-1',
  isResolved: true,
  setSpaces: vi.fn(),
  setActiveSpace: vi.fn(),
  resolveActiveSpace: vi.fn(),
  clear: vi.fn(),
  ...overrides,
});

describe('SpaceSwitcher', () => {
  beforeEach(() => {
    useSidebarStore.setState({ collapsed: false, drawerOpen: false });
    vi.mocked(useSpaces).mockReturnValue({ data: mockSpaces } as unknown as ReturnType<typeof useSpaces>);
    vi.mocked(useSpacesStore).mockImplementation((selector) =>
      selector(makeStoreState())
    );
  });

  it('renders the current space name', () => {
    render(<SpaceSwitcher />);
    const currentSpanElements = screen.getAllByText('Design Team');
    expect(currentSpanElements.length).toBeGreaterThan(0);
    expect(currentSpanElements[0]).toBeInTheDocument();
  });

  it('renders space switcher container', () => {
    render(<SpaceSwitcher />);
    expect(screen.getByTestId('space-switcher')).toBeInTheDocument();
  });

  it('hides name when sidebar is collapsed', () => {
    useSidebarStore.setState({ collapsed: true });
    render(<SpaceSwitcher />);
    expect(screen.getByTestId('space-switcher')).toBeInTheDocument();
    expect(screen.queryByText('Design Team')).not.toBeInTheDocument();
  });

  it('renders nothing when no spaces are available', () => {
    vi.mocked(useSpacesStore).mockImplementation((selector) =>
      selector(makeStoreState({ availableSpaces: [], currentSpaceId: null }))
    );
    vi.mocked(useSpaces).mockReturnValue({ data: [] } as unknown as ReturnType<typeof useSpaces>);
    render(<SpaceSwitcher />);
    expect(screen.queryByText('Design Team')).not.toBeInTheDocument();
  });
});
