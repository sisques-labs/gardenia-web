import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import careScheduleDict from '@/core/care-schedule/presentation/i18n/en';
import homeDict from '@/core/home/presentation/i18n/en';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';

const mockUseCareSchedules = vi.fn();
const mockCompleteMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock('@/core/care-schedule/presentation/hooks/use-care-schedules/use-care-schedules.hook', () => ({
  useCareSchedules: (...args: unknown[]) => mockUseCareSchedules(...args),
}));

vi.mock('@/core/care-schedule/presentation/hooks/use-complete-care-schedule/use-complete-care-schedule.hook', () => ({
  useCompleteCareSchedule: () => ({ mutate: mockCompleteMutate }),
}));

vi.mock('@/core/care-schedule/presentation/hooks/use-delete-care-schedule/use-delete-care-schedule.hook', () => ({
  useDeleteCareSchedule: () => ({ mutate: mockDeleteMutate }),
}));

vi.mock('@/core/plants/presentation/hooks/use-plants/use-plants.hook', () => ({
  usePlants: () => ({ data: [{ id: 'plant-1', name: 'Tomate cherry' }] }),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: (selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 'space-1' }),
}));

import { TodayTasksSection } from './today-tasks-section';

const mockCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'WATERING',
  intervalDays: 3,
  quantity: null,
  unit: null,
  notes: null,
  nextDueAt: '2026-07-04',
  lastCompletedAt: null,
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-01',
};

describe('TodayTasksSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the skeleton while loading', () => {
    mockUseCareSchedules.mockReturnValue({ careSchedules: [], isLoading: true });
    render(<TodayTasksSection dict={homeDict} careScheduleDict={careScheduleDict} />);
    expect(screen.queryByText(homeDict.sections.todayTasks.title)).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no due tasks', () => {
    mockUseCareSchedules.mockReturnValue({ careSchedules: [], isLoading: false });
    render(<TodayTasksSection dict={homeDict} careScheduleDict={careScheduleDict} />);
    expect(screen.getByText(homeDict.sections.todayTasks.empty)).toBeInTheDocument();
  });

  it('renders a row per due care schedule with the resolved plant name', () => {
    mockUseCareSchedules.mockReturnValue({ careSchedules: [mockCareSchedule], isLoading: false });
    render(<TodayTasksSection dict={homeDict} careScheduleDict={careScheduleDict} />);
    expect(screen.getByText(careScheduleDict.row.activityTypes.WATERING)).toBeInTheDocument();
    expect(screen.getByText(/Tomate cherry/)).toBeInTheDocument();
  });

  it('completes a task when its complete action is triggered', () => {
    mockUseCareSchedules.mockReturnValue({ careSchedules: [mockCareSchedule], isLoading: false });
    render(<TodayTasksSection dict={homeDict} careScheduleDict={careScheduleDict} />);
    screen.getByText(careScheduleDict.row.complete).click();
    expect(mockCompleteMutate).toHaveBeenCalledWith({ id: 'cs-1' });
  });

  it('requests due-before-today active schedules from the current space', () => {
    mockUseCareSchedules.mockReturnValue({ careSchedules: [], isLoading: false });
    render(<TodayTasksSection dict={homeDict} careScheduleDict={careScheduleDict} />);
    expect(mockUseCareSchedules).toHaveBeenCalledWith({ active: true, dueBefore: expect.any(String) });
  });
});
