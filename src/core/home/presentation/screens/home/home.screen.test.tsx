import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const mockAuthSelector = vi.fn();
const mockSpacesSelector = vi.fn();

vi.mock('@/core/auth/infrastructure/store/auth.store', () => ({
  useAuthStore: (selector: (s: { currentUser: { id: string; email: string } | null }) => unknown) =>
    mockAuthSelector(selector),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: (selector: (s: { availableSpaces: Array<{ id: string; name: string; ownerId: string; createdAt: string }>; currentSpaceId: string | null }) => unknown) =>
    mockSpacesSelector(selector),
}));

import { HomeScreen } from './home.screen';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const mockDict: AppDict['home'] = {
  topbar: { search: 'Search', newEntry: 'Nueva entrada' },
  greeting: 'Hello',
  sections: {
    todayTasks: { title: "Today's tasks", inProgress: 'En desarrollo tareas' },
    growingNow: { title: 'Growing now', inProgress: 'En desarrollo crecimiento' },
    miniMap: { title: 'Garden map', inProgress: 'En desarrollo mapa' },
    harvestPace: { title: 'Harvest pace', inProgress: 'En desarrollo cosecha' },
    journal: { title: 'Journal', inProgress: 'En desarrollo diario' },
  },
  inProgress: 'En desarrollo',
};

beforeEach(() => {
  mockAuthSelector.mockImplementation((selector: (s: { currentUser: { id: string; email: string } }) => unknown) =>
    selector({ currentUser: { id: '1', email: 'ana@example.com' } })
  );
  mockSpacesSelector.mockImplementation((selector: (s: { availableSpaces: Array<{ id: string; name: string; ownerId: string; createdAt: string }>; currentSpaceId: string }) => unknown) =>
    selector({
      availableSpaces: [{ id: 'space-1', name: 'Mi Huerto', ownerId: 'u1', createdAt: '' }],
      currentSpaceId: 'space-1',
    })
  );
});

describe('HomeScreen', () => {
  it('renders greeting text with email prefix', () => {
    render(<HomeScreen dict={mockDict} />);
    expect(screen.getByText(/ana/i)).toBeInTheDocument();
  });

  it('renders TodayTasksSection inProgress text', () => {
    render(<HomeScreen dict={mockDict} />);
    expect(screen.getByText('En desarrollo tareas')).toBeInTheDocument();
  });

  it('renders GrowingNowSection inProgress text', () => {
    render(<HomeScreen dict={mockDict} />);
    expect(screen.getByText('En desarrollo crecimiento')).toBeInTheDocument();
  });

  it('renders MiniMapSection inProgress text', () => {
    render(<HomeScreen dict={mockDict} />);
    expect(screen.getByText('En desarrollo mapa')).toBeInTheDocument();
  });

  it('renders HarvestPaceSection inProgress text', () => {
    render(<HomeScreen dict={mockDict} />);
    expect(screen.getByText('En desarrollo cosecha')).toBeInTheDocument();
  });

  it('renders JournalSection inProgress text', () => {
    render(<HomeScreen dict={mockDict} />);
    expect(screen.getByText('En desarrollo diario')).toBeInTheDocument();
  });
});
