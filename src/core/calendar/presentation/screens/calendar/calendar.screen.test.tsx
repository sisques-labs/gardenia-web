import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CalendarScreen } from './calendar.screen';
import { useCalendarStore } from '../../../infrastructure/store/calendar.store';
import { toISODate } from '../../utils/to-iso-date/to-iso-date.util';

vi.mock('../../components/calendar-grid/calendar-grid', () => ({
  CalendarGrid: (props: Record<string, unknown>) => (
    <div data-testid="calendar-grid-mock">
      <button onClick={() => (props.onSelectDate as (iso: string) => void)('2026-07-04')}>select</button>
      <span data-testid="grid-year">{String(props.year)}</span>
      <span data-testid="grid-month">{String(props.month)}</span>
      <span data-testid="grid-selected">{String(props.selectedDate)}</span>
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
    inDevLabel: 'Tareas del día',
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
  it('renders PageHeader with the screen title in eyebrow', () => {
    render(<CalendarScreen dict={dict} />);
    expect(screen.getByText(/Calendario/)).toBeInTheDocument();
  });

  it('renders PageHeader title with month and year', () => {
    render(<CalendarScreen dict={dict} />);
    expect(screen.getByRole('heading', { name: /Mayo 2026/ })).toBeInTheDocument();
  });

  it('renders PageHeader subtitle with season', () => {
    render(<CalendarScreen dict={dict} />);
    expect(screen.getByText(/primavera/i)).toBeInTheDocument();
  });

  it('renders CalendarGrid with store year, month and selectedDate', () => {
    render(<CalendarScreen dict={dict} />);
    expect(screen.getByTestId('calendar-grid-mock')).toBeInTheDocument();
    expect(screen.getByTestId('grid-year').textContent).toBe('2026');
    expect(screen.getByTestId('grid-month').textContent).toBe('4');
    expect(screen.getByTestId('grid-selected').textContent).toBe(todayISO);
  });

  it('renders DayTasksPanel with selectedDate from store', () => {
    render(<CalendarScreen dict={dict} />);
    expect(screen.getByTestId('day-tasks-panel-mock')).toBeInTheDocument();
    expect(screen.getByTestId('panel-selected').textContent).toBe(todayISO);
  });

  it('prev-month button calls store prevMonth', async () => {
    const spy = vi.spyOn(useCalendarStore.getState(), 'prevMonth');
    render(<CalendarScreen dict={dict} />);
    screen.getByRole('button', { name: /mes anterior/i }).click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('next-month button calls store nextMonth', async () => {
    const spy = vi.spyOn(useCalendarStore.getState(), 'nextMonth');
    render(<CalendarScreen dict={dict} />);
    screen.getByRole('button', { name: /mes siguiente/i }).click();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('onSelectDate callback calls store setSelectedDate', async () => {
    const spy = vi.spyOn(useCalendarStore.getState(), 'setSelectedDate');
    render(<CalendarScreen dict={dict} />);
    screen.getByText('select').click();
    expect(spy).toHaveBeenCalledWith('2026-07-04');
  });
});
