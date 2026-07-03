import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import dict from '@/core/care-schedule/presentation/i18n/en';

const mockCompleteMutate = vi.hoisted(() => vi.fn());
const mockDeleteMutate = vi.hoisted(() => vi.fn());

vi.mock('@/core/care-schedule/presentation/hooks/use-care-schedules/use-care-schedules.hook', () => ({
  useCareSchedules: vi.fn(() => ({ careSchedules: [], isLoading: false })),
}));

vi.mock('@/core/care-schedule/presentation/hooks/use-complete-care-schedule/use-complete-care-schedule.hook', () => ({
  useCompleteCareSchedule: () => ({ mutate: mockCompleteMutate }),
}));

vi.mock('@/core/care-schedule/presentation/hooks/use-delete-care-schedule/use-delete-care-schedule.hook', () => ({
  useDeleteCareSchedule: () => ({ mutate: mockDeleteMutate }),
}));

vi.mock('@/core/care-schedule/presentation/components/care-schedule-modal/care-schedule-modal', () => ({
  CareScheduleModal: ({ lockedPlantId, careSchedule, onClose }: { lockedPlantId?: string; careSchedule?: CareSchedule; onClose: () => void }) => (
    <div data-testid={careSchedule ? 'edit-modal' : 'create-modal'} data-locked-plant-id={lockedPlantId}>
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

import { useCareSchedules } from '@/core/care-schedule/presentation/hooks/use-care-schedules/use-care-schedules.hook';
import { CareScheduleList } from './care-schedule-list';

const mockCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'WATERING',
  intervalDays: 3,
  quantity: null,
  unit: null,
  notes: null,
  nextDueAt: '2026-07-05',
  lastCompletedAt: null,
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-07-01',
  updatedAt: '2026-07-01',
};

describe('CareScheduleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCareSchedules).mockReturnValue({ careSchedules: [], isLoading: false } as never);
  });

  it('shows the empty state when the plant has no care schedules', () => {
    render(<CareScheduleList plantId="plant-1" dict={dict} />);
    expect(screen.getByText(dict.tab.empty)).toBeInTheDocument();
  });

  it('renders the given title next to the "new task" button when provided', () => {
    render(<CareScheduleList plantId="plant-1" dict={dict} title="Upcoming tasks" />);
    expect(screen.getByText('Upcoming tasks')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(dict.tab.newTask, 'i') })).toBeInTheDocument();
  });

  it('lists a CareScheduleRow per care schedule', () => {
    vi.mocked(useCareSchedules).mockReturnValue({ careSchedules: [mockCareSchedule], isLoading: false } as never);
    render(<CareScheduleList plantId="plant-1" dict={dict} />);
    expect(screen.getByText(dict.row.activityTypes.WATERING)).toBeInTheDocument();
  });

  it('opens the create modal locked to plantId when "+ new task" is clicked', () => {
    render(<CareScheduleList plantId="plant-1" dict={dict} />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(dict.tab.newTask, 'i') }));
    expect(screen.getByTestId('create-modal')).toHaveAttribute('data-locked-plant-id', 'plant-1');
  });

  it('closes the create modal when onClose is called', () => {
    render(<CareScheduleList plantId="plant-1" dict={dict} />);
    fireEvent.click(screen.getByRole('button', { name: new RegExp(dict.tab.newTask, 'i') }));
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByTestId('create-modal')).toBeNull();
  });

  it('opens the edit modal for the clicked row', () => {
    vi.mocked(useCareSchedules).mockReturnValue({ careSchedules: [mockCareSchedule], isLoading: false } as never);
    render(<CareScheduleList plantId="plant-1" dict={dict} />);
    fireEvent.click(screen.getByRole('button', { name: dict.row.edit }));
    expect(screen.getByTestId('edit-modal')).toBeInTheDocument();
  });

  it('calls complete mutation with the id when a row is completed', () => {
    vi.mocked(useCareSchedules).mockReturnValue({ careSchedules: [mockCareSchedule], isLoading: false } as never);
    render(<CareScheduleList plantId="plant-1" dict={dict} />);
    fireEvent.click(screen.getByRole('button', { name: dict.row.complete }));
    expect(mockCompleteMutate).toHaveBeenCalledWith({ id: 'cs-1' });
  });

  it('calls delete mutation with the id when a row is deleted', () => {
    vi.mocked(useCareSchedules).mockReturnValue({ careSchedules: [mockCareSchedule], isLoading: false } as never);
    render(<CareScheduleList plantId="plant-1" dict={dict} />);
    fireEvent.click(screen.getByRole('button', { name: dict.row.delete }));
    expect(mockDeleteMutate).toHaveBeenCalledWith('cs-1');
  });
});
