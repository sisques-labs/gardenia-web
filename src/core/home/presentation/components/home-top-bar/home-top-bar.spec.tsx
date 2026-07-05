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

import { HomeTopBar } from './home-top-bar';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const dict: AppDict['home'] = {
  topbar: {
    search: 'Search',
    newEntry: 'Nueva entrada',
    notifications: 'Notifications',
    createMenu: {
      label: 'Create',
      newPlant: 'New plant',
      newJournalEntry: 'New journal entry',
    },
  },
  greeting: 'Hello',
  sections: {
    todayTasks: { title: "Today's tasks", empty: 'No tasks due today.' },
    growingNow: { title: 'Growing now', empty: 'No active plants yet.', andMore: 'and {count} more' },
    plantingSpotsSummary: { title: 'Planting spots', active: 'Active', fallow: 'Fallow', empty: 'No planting spots yet.' },
    harvestPace: { title: 'Harvest pace', inProgress: 'En desarrollo' },
    journal: { title: 'Journal', inProgress: 'En desarrollo' },
  },
};

const defaultSpacesState = {
  availableSpaces: [{ id: 'space-1', name: 'Mi Huerto', ownerId: 'u1', createdAt: '' }],
  currentSpaceId: 'space-1',
};

function setupMocks(currentUser: { id: string; email: string } | null = { id: '1', email: 'ana@example.com' }) {
  mockAuthSelector.mockImplementation((selector: (s: { currentUser: typeof currentUser }) => unknown) =>
    selector({ currentUser })
  );
  mockSpacesSelector.mockImplementation((selector: (s: typeof defaultSpacesState) => unknown) =>
    selector(defaultSpacesState)
  );
}

describe('HomeTopBar', () => {
  beforeEach(() => {
    setupMocks();
  });

  it('shows email prefix in greeting', () => {
    render(<HomeTopBar dict={dict} />);
    expect(screen.getByText(/ana/i)).toBeInTheDocument();
  });

  it('shows search input', () => {
    render(<HomeTopBar dict={dict} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shows bell icon button', () => {
    render(<HomeTopBar dict={dict} />);
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('shows "Nueva entrada" button', () => {
    render(<HomeTopBar dict={dict} />);
    expect(screen.getByRole('button', { name: /nueva entrada/i })).toBeInTheDocument();
  });

  it('shows space name as fallback when currentUser is null', () => {
    setupMocks(null);
    render(<HomeTopBar dict={dict} />);
    expect(screen.getByText(/mi huerto/i)).toBeInTheDocument();
  });
});
