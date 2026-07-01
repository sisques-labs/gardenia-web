import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DayTasksPanel } from './day-tasks-panel';
import { toISODate } from '../../utils/to-iso-date/to-iso-date.util';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import careScheduleDict from '@/core/care-schedule/presentation/i18n/en';

vi.mock('@/core/care-schedule/presentation/components/care-schedule-row/care-schedule-row', () => ({
  CareScheduleRow: ({ careSchedule, plantName }: { careSchedule: CareSchedule; plantName?: string }) => (
    <div data-testid={`row-${careSchedule.id}`}>{plantName}</div>
  ),
}));

const dict = {
  todayPrefix: 'Hoy',
  monthAbbreviations: {
    january: 'ene', february: 'feb', march: 'mar', april: 'abr', may: 'may', june: 'jun',
    july: 'jul', august: 'ago', september: 'sep', october: 'oct', november: 'nov', december: 'dic',
  },
};

const mockCareSchedule: CareSchedule = {
  id: 'cs-1',
  plantId: 'plant-1',
  activityType: 'WATERING',
  intervalDays: 3,
  quantity: null,
  unit: null,
  notes: null,
  nextDueAt: '2026-05-18',
  lastCompletedAt: null,
  active: true,
  userId: 'user-1',
  spaceId: 'space-1',
  createdAt: '2026-05-01',
  updatedAt: '2026-05-01',
};

const baseProps = {
  careScheduleDict,
  plants: [{ id: 'plant-1', name: 'Monstera' }],
  onComplete: vi.fn(),
  onDelete: vi.fn(),
};

describe('DayTasksPanel — header', () => {
  it('shows "Hoy" prefix when selectedDate is today', () => {
    const todayISO = toISODate(new Date());
    render(<DayTasksPanel selectedDate={todayISO} dict={dict} careSchedules={[]} isLoading={false} {...baseProps} />);
    expect(screen.getByText(/Hoy/)).toBeInTheDocument();
  });

  it('does NOT show "Hoy" for a non-today date', () => {
    render(<DayTasksPanel selectedDate="2020-01-01" dict={dict} careSchedules={[]} isLoading={false} {...baseProps} />);
    expect(screen.queryByText(/Hoy/)).toBeNull();
  });

  it('shows formatted day and month for any date', () => {
    render(<DayTasksPanel selectedDate="2026-05-18" dict={dict} careSchedules={[]} isLoading={false} {...baseProps} />);
    expect(screen.getByText(/18/)).toBeInTheDocument();
  });
});

describe('DayTasksPanel — body', () => {
  it('shows the empty state when there are no care schedules and not loading', () => {
    render(<DayTasksPanel selectedDate="2026-05-18" dict={dict} careSchedules={[]} isLoading={false} {...baseProps} />);
    expect(screen.getByText(careScheduleDict.panel.empty)).toBeInTheDocument();
  });

  it('renders a CareScheduleRow per care schedule with the resolved plant name', () => {
    render(
      <DayTasksPanel
        selectedDate="2026-05-18"
        dict={dict}
        careSchedules={[mockCareSchedule]}
        isLoading={false}
        {...baseProps}
      />,
    );
    expect(screen.getByTestId('row-cs-1')).toHaveTextContent('Monstera');
  });

  it('does not show the empty state while loading', () => {
    render(<DayTasksPanel selectedDate="2026-05-18" dict={dict} careSchedules={[]} isLoading {...baseProps} />);
    expect(screen.queryByText(careScheduleDict.panel.empty)).toBeNull();
  });
});
