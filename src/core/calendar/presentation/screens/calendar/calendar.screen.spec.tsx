import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalendarScreen } from './calendar.screen';
import { useCalendarStore } from '../../../infrastructure/store/calendar.store';
import { toISODate } from '../../utils/to-iso-date/to-iso-date.util';
import { useCareSchedules } from '@/core/care-schedule/presentation/hooks/use-care-schedules/use-care-schedules.hook';
import careScheduleDict from '@/core/care-schedule/presentation/i18n/en';

vi.mock('../../components/calendar-grid/calendar-grid', () => ({
  CalendarGrid: (props: Record<string, unknown>) => (
    <div data-testid="calendar-grid-mock">
      <button onClick={() => (props.onSelectDate as (iso: string) => void)('2026-07-04')}>select</button>
      <span data-testid="grid-year">{String(props.year)}</span>
      <span data-testid="grid-month">{String(props.month)}</span>
      <span data-testid="grid-selected">{String(props.selectedDate)}</span>
      <span data-testid="grid-task-counts">{JSON.stringify(props.taskCountByDate ?? null)}</span>
    </div>
  ),
}));

vi.mock('../../components/day-tasks-panel/day-tasks-panel', () => ({
  DayTasksPanel: (props: Record<string, unknown>) => (
    <div data-testid="day-tasks-panel-mock">
      <span data-testid="panel-selected">{String(props.selectedDate)}</span>
    </div>
  ),
}));

vi.mock('../../components/calendar-view-switcher/calendar-view-switcher', () => ({
  CalendarViewSwitcher: () => <div data-testid="view-switcher-mock" />,
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
  usePlants: vi.fn(() => ({ data: [] })),
}));

vi.mock('@/core/spaces/infrastructure/store/spaces.store', () => ({
  useSpacesStore: vi.fn((selector: (s: { currentSpaceId: string | null }) => unknown) =>
    selector({ currentSpaceId: 's1' })),
}));

vi.mock('@/core/care-schedule/presentation/components/care-schedule-modal/care-schedule-modal', () => ({
  CareScheduleModal: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="care-schedule-modal-mock">
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

const today = new Date();
const todayISO = toISODate(today);

const dict = {
  screenTitle: 'Calendario',
  monthlyView: 'Vista mensual',
  addTask: 'Nueva tarea',
  navigation: { prevMonth: 'Mes anterior', nextMonth: 'Mes siguiente' },
  viewSwitcher: { day: 'Día', week: 'Semana', month: 'Mes', year: 'Año' },
  grid: {
    weekdays: { mon: 'L', tue: 'M', wed: 'X', thu: 'J', fri: 'V', sat: 'S', sun: 'D' },
    seasons: { spring: 'primavera', summer: 'verano', autumn: 'otoño', winter: 'invierno' },
    months: {
      january: 'Enero', february: 'Febrero', march: 'Marzo', april: 'Abril',
      may: 'Mayo', june: 'Junio', july: 'Julio', august: 'Agosto',
      september: 'Septiembre', october: 'Octubre', november: 'Noviembre', december: 'Diciembre',
    },
    overflow: 'más',
    dayAriaLabel: 'Día {day}',
    todayBadge: 'hoy',
    viewSwitcher: { day: 'Día', week: 'Semana', month: 'Mes', year: 'Año' },
  },
  panel: {
    todayPrefix: 'Hoy',
    monthAbbreviations: {
      january: 'ene', february: 'feb', march: 'mar', april: 'abr', may: 'may', june: 'jun',
      july: 'jul', august: 'ago', september: 'sep', october: 'oct', november: 'nov', december: 'dic',
    },
  },
};

beforeEach(() => {
  useCalendarStore.setState({
    selectedDate: todayISO,
    currentYear: 2026,
    currentMonth: 4, // May
  });
});

describe('CalendarScreen', () => {
  it('renders ScreenHeader with the screen title in eyebrow', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    expect(screen.getByText(/Calendario/)).toBeInTheDocument();
  });

  it('renders ScreenHeader title with month and year', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    expect(screen.getByRole('heading', { name: /Mayo 2026/ })).toBeInTheDocument();
  });

  it('renders ScreenHeader subtitle with season', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    expect(screen.getByText(/primavera/i)).toBeInTheDocument();
  });

  it('renders CalendarGrid with store year, month and selectedDate', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    expect(screen.getByTestId('calendar-grid-mock')).toBeInTheDocument();
    expect(screen.getByTestId('grid-year').textContent).toBe('2026');
    expect(screen.getByTestId('grid-month').textContent).toBe('4');
    expect(screen.getByTestId('grid-selected').textContent).toBe(todayISO);
  });

  it('renders DayTasksPanel with selectedDate from store', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    expect(screen.getByTestId('day-tasks-panel-mock')).toBeInTheDocument();
    expect(screen.getByTestId('panel-selected').textContent).toBe(todayISO);
  });

  it('renders the task list below the calendar in document order', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    const grid = screen.getByTestId('calendar-grid-mock');
    const panel = screen.getByTestId('day-tasks-panel-mock');
    expect(grid.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('prev-month button calls store prevMonth', async () => {
    const spy = vi.spyOn(useCalendarStore.getState(), 'prevMonth');
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    screen.getByRole('button', { name: /mes anterior/i }).click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('next-month button calls store nextMonth', async () => {
    const spy = vi.spyOn(useCalendarStore.getState(), 'nextMonth');
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    screen.getByRole('button', { name: /mes siguiente/i }).click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('onSelectDate callback calls store setSelectedDate', async () => {
    const spy = vi.spyOn(useCalendarStore.getState(), 'setSelectedDate');
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    screen.getByText('select').click();
    expect(spy).toHaveBeenCalledWith('2026-07-04');
  });

  it('does not show the create modal initially', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    expect(screen.queryByTestId('care-schedule-modal-mock')).toBeNull();
  });

  it('opens the create modal when "+ Añadir tarea" is clicked', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    fireEvent.click(screen.getByRole('button', { name: /nueva tarea/i }));
    expect(screen.getByTestId('care-schedule-modal-mock')).toBeInTheDocument();
  });

  it('closes the create modal when onClose is called', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    fireEvent.click(screen.getByRole('button', { name: /nueva tarea/i }));
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByTestId('care-schedule-modal-mock')).toBeNull();
  });

  it('fetches active care schedules due within the full visible month (May 2026) for the badge counts', () => {
    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    const monthCall = vi.mocked(useCareSchedules).mock.calls.find(([filters]) => 'dueFrom' in (filters ?? {}));
    expect(monthCall?.[0]).toEqual({ active: true, dueFrom: '2026-05-01', dueTo: '2026-05-31' });
  });

  it('passes a taskCountByDate map (grouped from the month care schedules) to the grid', () => {
    vi.mocked(useCareSchedules).mockImplementation((filters?: { dueFrom?: string }) => {
      if (filters?.dueFrom) {
        return {
          careSchedules: [
            { nextDueAt: '2026-05-12' },
            { nextDueAt: '2026-05-12' },
            { nextDueAt: '2026-05-20' },
          ] as never,
          isLoading: false,
          error: null,
        };
      }
      return { careSchedules: [], isLoading: false, error: null };
    });

    render(<CalendarScreen dict={dict} careScheduleDict={careScheduleDict} />);
    expect(screen.getByTestId('grid-task-counts').textContent).toBe(
      JSON.stringify({ '2026-05-12': 2, '2026-05-20': 1 }),
    );
  });
});
