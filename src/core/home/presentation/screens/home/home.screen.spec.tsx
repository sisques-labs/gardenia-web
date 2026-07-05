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

vi.mock('@/core/care-schedule/presentation/hooks/use-care-schedules/use-care-schedules.hook', () => ({
  useCareSchedules: vi.fn(() => ({ careSchedules: [], isLoading: false })),
}));

vi.mock('@/core/care-schedule/presentation/hooks/use-complete-care-schedule/use-complete-care-schedule.hook', () => ({
  useCompleteCareSchedule: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock('@/core/care-schedule/presentation/hooks/use-delete-care-schedule/use-delete-care-schedule.hook', () => ({
  useDeleteCareSchedule: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock('@/core/plants/presentation/hooks/use-plants/use-plants.hook', () => ({
  usePlants: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/core/planting-spots/presentation/hooks/use-planting-spots/use-planting-spots.hook', () => ({
  usePlantingSpots: vi.fn(() => ({ spots: [], isLoading: false })),
}));

import { HomeScreen } from './home.screen';
import careScheduleDict from '@/core/care-schedule/presentation/i18n/en';
import plantingSpotsDict from '@/core/planting-spots/presentation/i18n/en';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const mockDict: AppDict['home'] = {
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
    harvestPace: { title: 'Harvest pace', inProgress: 'En desarrollo cosecha' },
    journal: { title: 'Journal', inProgress: 'En desarrollo diario' },
  },
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
    render(<HomeScreen dict={mockDict} careScheduleDict={careScheduleDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText(/ana/i)).toBeInTheDocument();
  });

  it('renders TodayTasksSection empty state', () => {
    render(<HomeScreen dict={mockDict} careScheduleDict={careScheduleDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText('No tasks due today.')).toBeInTheDocument();
  });

  it('renders GrowingNowSection empty state', () => {
    render(<HomeScreen dict={mockDict} careScheduleDict={careScheduleDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText('No active plants yet.')).toBeInTheDocument();
  });

  it('renders PlantingSpotsSummarySection empty state', () => {
    render(<HomeScreen dict={mockDict} careScheduleDict={careScheduleDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText('No planting spots yet.')).toBeInTheDocument();
  });

  it('renders HarvestPaceSection title', () => {
    render(<HomeScreen dict={mockDict} careScheduleDict={careScheduleDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText('Harvest pace')).toBeInTheDocument();
  });

  it('renders JournalSection inProgress text', () => {
    render(<HomeScreen dict={mockDict} careScheduleDict={careScheduleDict} plantingSpotsDict={plantingSpotsDict} />);
    expect(screen.getByText('En desarrollo diario')).toBeInTheDocument();
  });
});
