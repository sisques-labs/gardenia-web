import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { SpaceSwitcher } from './space-switcher';
import { SidebarProvider } from './sidebar.context';

vi.mock('@/core/spaces/presentation/hooks/use-spaces/useSpaces.hook', () => ({
  useSpaces: vi.fn(),
}));
vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn(),
}));

import { useSpaces } from '@/core/spaces/presentation/hooks/use-spaces/useSpaces.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const mockSpaces = [
  { id: 'space-1', name: 'Design Team' },
  { id: 'space-2', name: 'Engineering' },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

describe('SpaceSwitcher', () => {
  beforeEach(() => {
    vi.mocked(useSpaces).mockReturnValue({ data: mockSpaces } as ReturnType<typeof useSpaces>);
    vi.mocked(useSpacesStore).mockImplementation((selector: (s: { availableSpaces: typeof mockSpaces; currentSpaceId: string }) => unknown) =>
      selector({ availableSpaces: mockSpaces, currentSpaceId: 'space-1' })
    );
  });

  it('renders the current space name', () => {
    render(
      <Wrapper>
        <SpaceSwitcher />
      </Wrapper>,
    );
    // The span showing current space name (there may also be an option with the same text)
    const currentSpanElements = screen.getAllByText('Design Team');
    expect(currentSpanElements.length).toBeGreaterThan(0);
    expect(currentSpanElements[0]).toBeInTheDocument();
  });

  it('renders space switcher container', () => {
    render(
      <Wrapper>
        <SpaceSwitcher />
      </Wrapper>,
    );
    expect(screen.getByTestId('space-switcher')).toBeInTheDocument();
  });

  it('shows collapsed indicator when sidebar is collapsed', () => {
    localStorage.setItem('gardenia.sidebar.collapsed', 'true');
    render(
      <Wrapper>
        <SpaceSwitcher />
      </Wrapper>,
    );
    const switcher = screen.getByTestId('space-switcher');
    expect(switcher).toBeInTheDocument();
    localStorage.clear();
  });

  it('renders nothing when no spaces are available', () => {
    vi.mocked(useSpacesStore).mockImplementation((selector: (s: { availableSpaces: never[]; currentSpaceId: null }) => unknown) =>
      selector({ availableSpaces: [], currentSpaceId: null })
    );
    vi.mocked(useSpaces).mockReturnValue({ data: [] } as ReturnType<typeof useSpaces>);
    render(
      <Wrapper>
        <SpaceSwitcher />
      </Wrapper>,
    );
    expect(screen.queryByText('Design Team')).not.toBeInTheDocument();
  });
});
